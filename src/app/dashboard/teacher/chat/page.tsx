'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeacherChatPage() {
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [lastMsgs, setLastMsgs] = useState<{[sid:string]: any}>({})
  const [activeStudent, setActiveStudent] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { window.location.href = '/auth/login'; return }
      const { data: my } = await supabase.from('users').select('id, name').eq('id', session.user.id).single()
      setMe(my)
      const { data: cls } = await supabase.from('classes').select('id, name').eq('teacher_id', session.user.id)
      setClasses(cls || [])
      if (cls && cls.length > 0) setSelectedClass(cls[0].id)
      setLoading(false)
    }
    init()
  }, [])

  // تحميل التلاميذ وآخر رسالة من كل محادثة
  useEffect(() => {
    if (!selectedClass || !me) return
    setActiveStudent(null)
    const load = async () => {
      const { data: studs } = await supabase.from('users').select('id, name').eq('class_id', selectedClass).order('name')
      setStudents(studs || [])
      const { data: privMsgs } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at')
        .eq('class_id', selectedClass)
        .eq('deleted', false)
        .not('recipient_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(300)
      const map: {[sid:string]: any} = {}
      ;(privMsgs || []).forEach((m: any) => {
        const sid = m.sender_id === me.id ? m.recipient_id : m.sender_id
        if (!map[sid]) map[sid] = m
      })
      setLastMsgs(map)
    }
    load()
  }, [selectedClass, me])

  const loadThread = async (student: any) => {
    if (!selectedClass || !me) return
    const { data } = await supabase
      .from('messages')
      .select('id, created_at, sender_id, content')
      .eq('class_id', selectedClass)
      .eq('deleted', false)
      .not('recipient_id', 'is', null)
      .or(`and(sender_id.eq.${student.id},recipient_id.eq.${me.id}),and(sender_id.eq.${me.id},recipient_id.eq.${student.id})`)
      .order('created_at', { ascending: true })
      .limit(150)
    setMessages(data || [])
  }

  useEffect(() => {
    if (!activeStudent) return
    loadThread(activeStudent)
    const iv = setInterval(() => loadThread(activeStudent), 4000)
    return () => clearInterval(iv)
  }, [activeStudent])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  const send = async () => {
    const content = text.trim()
    if (!content || sending || !activeStudent) return
    setSending(true)
    await supabase.from('messages').insert({
      class_id: selectedClass, sender_id: me.id, recipient_id: activeStudent.id, content
    })
    setText('')
    await loadThread(activeStudent)
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

  // ===== واجهة المحادثة مع تلميذ محدد =====
  if (activeStudent) return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial",display:"flex",flexDirection:"column"}}>
      <nav style={{background:"white",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{background:"#dbeafe",borderRadius:"50%",width:"42px",height:"42px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px"}}>🎒</span>
          <h1 style={{color:"#1e3a8a",fontSize:"17px",fontWeight:"bold",margin:0}}>{activeStudent.name}</h1>
        </div>
        <button onClick={() => setActiveStudent(null)}
          style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 14px",borderRadius:"8px",border:"none",fontWeight:"bold",fontSize:"13px",cursor:"pointer"}}>← قائمة التلاميذ</button>
      </nav>

      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:"10px"}}>
        {messages.length === 0 && (
          <p style={{textAlign:"center",color:"#9ca3af",marginTop:"40px",fontSize:"15px"}}>لا توجد رسائل بعد مع هذا التلميذ</p>
        )}
        {messages.map(m => {
          const mine = m.sender_id === me.id
          return (
            <div key={m.id} style={{maxWidth:"78%",alignSelf: mine ? "flex-start" : "flex-end"}}>
              <div style={{
                background: mine ? "#fefce8" : "white",
                border: mine ? "2px solid #fbbf24" : "1px solid #e5e7eb",
                borderRadius: mine ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                padding:"9px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:"14.5px",lineHeight:"1.7",color:"#1e293b",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{m.content}</div>
                <div style={{fontSize:"10px",color:"#9ca3af",marginTop:"4px",textAlign:"left"}}>{fmtTime(m.created_at)}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      <div style={{background:"white",borderTop:"1px solid #e5e7eb",padding:"12px 16px",flexShrink:0}}>
        <div style={{display:"flex",gap:"10px"}}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder={`اكتب رداً لـ ${activeStudent.name}...`}
            maxLength={1000}
            style={{flex:1,padding:"12px 16px",borderRadius:"24px",border:"2px solid #e5e7eb",fontSize:"15px",fontFamily:"Arial",direction:"rtl",outline:"none",background:"#f9fafb"}}
          />
          <button onClick={send} disabled={sending}
            style={{background:"#16a34a",color:"white",border:"none",borderRadius:"50%",width:"46px",height:"46px",cursor:"pointer",fontSize:"18px",flexShrink:0}}>
            {sending ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </main>
  )

  // ===== قائمة التلاميذ =====
  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",flexWrap:"wrap",gap:"8px"}}>
        <h1 style={{color:"#16a34a",fontSize:"20px",fontWeight:"bold",margin:0}}>💬 رسائل التلاميذ</h1>
        <a href="/dashboard/teacher" style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>العودة للوحة</a>
      </nav>

      <div style={{maxWidth:"650px",margin:"0 auto",padding:"20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"18px"}}>
          <label style={{fontWeight:"bold",color:"#374151",fontSize:"14px"}}>الفصل:</label>
          <select value={selectedClass ?? ''} onChange={e => setSelectedClass(Number(e.target.value))}
            style={{padding:"9px 14px",borderRadius:"8px",border:"2px solid #e5e7eb",fontSize:"14px",direction:"rtl",background:"white",cursor:"pointer",flex:1}}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {students.length === 0 ? (
          <p style={{textAlign:"center",color:"#9ca3af",padding:"30px",fontSize:"15px"}}>لا يوجد تلاميذ في هذا الفصل بعد</p>
        ) : (
          <div style={{background:"white",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",overflow:"hidden"}}>
            {students.map((s, idx) => {
              const last = lastMsgs[s.id]
              return (
                <div key={s.id} onClick={() => setActiveStudent(s)}
                  style={{display:"flex",alignItems:"center",gap:"12px",padding:"13px 16px",cursor:"pointer",
                    borderBottom: idx < students.length-1 ? "1px solid #f3f4f6" : "none",transition:"background 0.15s"}}
                  onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background="#f0f9ff"}}
                  onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background="white"}}>
                  <span style={{background:"#dbeafe",borderRadius:"50%",width:"42px",height:"42px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>🎒</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:"bold",color:"#1e293b",fontSize:"15px"}}>{s.name}</div>
                    <div style={{color:"#9ca3af",fontSize:"12.5px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                      {last ? (last.sender_id === me.id ? "أنت: " : "") + last.content : "لا رسائل بعد — اضغط لبدء محادثة"}
                    </div>
                  </div>
                  <span style={{color:"#9ca3af",fontSize:"11px",flexShrink:0}}>{last ? fmtTime(last.created_at) : ""}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}