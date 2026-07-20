'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { containsBanned } from '@/lib/chatRules'

export default function StudentChatPage() {
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<any>(null)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [teacherName, setTeacherName] = useState('الأستاذ(ة)')
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { window.location.href = '/auth/login'; return }
      const { data: my } = await supabase.from('users').select('id, name, class_id').eq('id', session.user.id).single()
      if (!my?.class_id) { setMe({ noClass: true }); setLoading(false); return }
      setMe(my)
      const { data: cls } = await supabase.from('classes').select('teacher_id').eq('id', my.class_id).single()
      if (cls?.teacher_id) {
        setTeacherId(cls.teacher_id)
        const { data: t } = await supabase.from('users').select('name').eq('id', cls.teacher_id).single()
        if (t?.name) setTeacherName(t.name)
        await loadMessages(my.class_id, my.id, cls.teacher_id)
      }
      setLoading(false)
    }
    init()
  }, [])

  const loadMessages = async (classId: number, myId: string, tId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id, created_at, sender_id, content')
      .eq('class_id', classId)
      .eq('deleted', false)
      .not('recipient_id', 'is', null)
      .or(`and(sender_id.eq.${myId},recipient_id.eq.${tId}),and(sender_id.eq.${tId},recipient_id.eq.${myId})`)
      .order('created_at', { ascending: true })
      .limit(150)
    setMessages(data || [])
  }

  useEffect(() => {
    if (!me?.class_id || !teacherId) return
    const iv = setInterval(() => loadMessages(me.class_id, me.id, teacherId), 4000)
    return () => clearInterval(iv)
  }, [me, teacherId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  const send = async () => {
    const content = text.trim()
    if (!content || sending || !teacherId) return
    setError('')
    if (containsBanned(content)) { setError('رسالتك تحتوي كلمة غير مناسبة 🚫 — أعد صياغتها بأدب'); return }
    setSending(true)
    const { error: err } = await supabase.from('messages').insert({
      class_id: me.class_id, sender_id: me.id, recipient_id: teacherId, content
    })
    if (err) setError('تعذر الإرسال، حاول مجدداً')
    else { setText(''); await loadMessages(me.class_id, me.id, teacherId) }
    setSending(false)
  }

  const fmtTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getDate()}/${d.getMonth()+1} — ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  if (loading) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  if (me?.noClass || !teacherId) return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",background:"white",borderRadius:"16px",padding:"40px",maxWidth:"400px"}}>
        <div style={{fontSize:"56px",marginBottom:"12px"}}>💬</div>
        <p style={{color:"#6b7280",fontSize:"16px",lineHeight:"1.9"}}>للتحدث مع أستاذك، انضم إلى فصله أولاً برمز الفصل من لوحتك.</p>
        <a href="/dashboard/student"><button style={{background:"#2563eb",color:"white",border:"none",padding:"12px 24px",borderRadius:"8px",cursor:"pointer",marginTop:"16px",fontWeight:"bold"}}>العودة للوحة</button></a>
      </div>
    </main>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial",display:"flex",flexDirection:"column"}}>

      <nav style={{background:"white",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{background:"#fef9c3",borderRadius:"50%",width:"42px",height:"42px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px"}}>👨‍🏫</span>
          <div>
            <h1 style={{color:"#1e3a8a",fontSize:"17px",fontWeight:"bold",margin:0}}>{teacherName}</h1>
            <p style={{color:"#9ca3af",fontSize:"12px",margin:0}}>دردشة خاصة مع أستاذك — يرد عليك في أقرب وقت</p>
          </div>
        </div>
        <a href="/dashboard/student" style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 14px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold",fontSize:"13px"}}>← العودة</a>
      </nav>

      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:"10px"}}>
        {messages.length === 0 && (
          <p style={{textAlign:"center",color:"#9ca3af",marginTop:"40px",fontSize:"15px"}}>لا توجد رسائل بعد — اسأل أستاذك عن أي شيء في دروسك! ✍️</p>
        )}
        {messages.map(m => {
          const mine = m.sender_id === me.id
          return (
            <div key={m.id} style={{maxWidth:"78%",alignSelf: mine ? "flex-start" : "flex-end"}}>
              <div style={{
                background: mine ? "#2563eb" : "#fefce8",
                color: mine ? "white" : "#1e293b",
                border: mine ? "none" : "2px solid #fbbf24",
                borderRadius: mine ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                padding:"9px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:"14.5px",lineHeight:"1.7",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{m.content}</div>
                <div style={{fontSize:"10px",color: mine ? "#bfdbfe" : "#9ca3af",marginTop:"4px",textAlign:"left"}}>{fmtTime(m.created_at)}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      <div style={{background:"white",borderTop:"1px solid #e5e7eb",padding:"12px 16px",flexShrink:0}}>
        {error && <p style={{color:"#dc2626",fontSize:"13px",fontWeight:"bold",margin:"0 0 8px 0",textAlign:"center"}}>{error}</p>}
        <div style={{display:"flex",gap:"10px"}}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder="اكتب رسالتك لأستاذك..."
            maxLength={1000}
            style={{flex:1,padding:"12px 16px",borderRadius:"24px",border:"2px solid #e5e7eb",fontSize:"15px",fontFamily:"Arial",direction:"rtl",outline:"none",background:"#f9fafb"}}
          />
          <button onClick={send} disabled={sending}
            style={{background:"#2563eb",color:"white",border:"none",borderRadius:"50%",width:"46px",height:"46px",cursor:"pointer",fontSize:"18px",flexShrink:0}}>
            {sending ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </main>
  )
}