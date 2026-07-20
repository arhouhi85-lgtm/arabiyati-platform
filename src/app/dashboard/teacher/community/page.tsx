'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeacherCommunityPage() {
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [names, setNames] = useState<{[id:string]: string}>({})
  const [messages, setMessages] = useState<any[]>([])
  const [pinnedMsg, setPinnedMsg] = useState<any>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [info, setInfo] = useState('')
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

  useEffect(() => {
    if (!selectedClass || !me) return
    const loadAll = async () => {
      const { data: members } = await supabase.from('users').select('id, name').eq('class_id', selectedClass)
      const map: {[id:string]: string} = { [me.id]: me.name }
      ;(members || []).forEach((u: any) => { map[u.id] = u.name })
      setNames(map)
      await loadMessages()
    }
    loadAll()
    const iv = setInterval(loadMessages, 4000)
    return () => clearInterval(iv)
  }, [selectedClass, me])

  const loadMessages = async () => {
    if (!selectedClass) return
    const { data } = await supabase
      .from('messages')
      .select('id, created_at, sender_id, content, pinned')
      .eq('class_id', selectedClass)
      .is('recipient_id', null)
      .eq('deleted', false)
      .order('created_at', { ascending: true })
      .limit(150)
    setMessages(data || [])
    const pinned = (data || []).filter((m: any) => m.pinned)
    setPinnedMsg(pinned.length > 0 ? pinned[pinned.length - 1] : null)
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  const send = async () => {
    const content = text.trim()
    if (!content || sending || !selectedClass) return
    setSending(true)
    await supabase.from('messages').insert({ class_id: selectedClass, sender_id: me.id, content })
    setText('')
    await loadMessages()
    setSending(false)
  }

  const deleteMsg = async (id: number) => {
    await supabase.from('messages').update({ deleted: true }).eq('id', id)
    await loadMessages()
    flash('🗑️ حُذفت الرسالة')
  }

  const togglePin = async (m: any) => {
    if (!m.pinned) {
      // إلغاء أي تثبيت سابق ثم تثبيت الجديدة
      await supabase.from('messages').update({ pinned: false }).eq('class_id', selectedClass).eq('pinned', true)
      await supabase.from('messages').update({ pinned: true }).eq('id', m.id)
      flash('📌 ثُبّتت الرسالة أعلى المجتمع')
    } else {
      await supabase.from('messages').update({ pinned: false }).eq('id', m.id)
      flash('تم إلغاء التثبيت')
    }
    await loadMessages()
  }

  const mute = async (studentId: string, hours: number) => {
    const until = new Date(Date.now() + hours * 3600 * 1000).toISOString()
    await supabase.from('muted_students').upsert(
      { class_id: selectedClass, student_id: studentId, muted_until: until },
      { onConflict: 'class_id,student_id' }
    )
    flash(`🔇 كُتم ${names[studentId] || 'التلميذ'} لمدة ${hours === 1 ? 'ساعة' : hours + ' ساعة'}`)
  }

  const flash = (msg: string) => { setInfo(msg); setTimeout(() => setInfo(''), 2500) }

  const fmtTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getDate()}/${d.getMonth()+1} — ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  if (loading) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial",display:"flex",flexDirection:"column"}}>

      {/* الترويسة بالصورة */}
      <div style={{position:"relative",height:"130px",overflow:"hidden",flexShrink:0}}>
        <img src="/images/community.jpg" alt="مجتمع المعرفة" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(30,58,138,0.55),rgba(30,58,138,0.75))",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <h1 style={{color:"white",fontSize:"24px",fontWeight:"bold",margin:0,textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>🌐 مجتمع المعرفة — إشراف الأستاذ</h1>
          <p style={{color:"#dbeafe",fontSize:"12px",margin:"4px 0 0 0"}}>شارك، ثبّت الإعلانات، واحذف ما يخالف الميثاق</p>
        </div>
        <a href="/dashboard/teacher" style={{position:"absolute",top:"12px",left:"12px",background:"rgba(255,255,255,0.92)",color:"#1e3a8a",padding:"7px 14px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold",fontSize:"13px"}}>← العودة</a>
      </div>

      {/* اختيار الفصل */}
      <div style={{background:"white",borderBottom:"1px solid #e5e7eb",padding:"10px 16px",display:"flex",alignItems:"center",gap:"12px",flexShrink:0}}>
        <label style={{fontWeight:"bold",color:"#374151",fontSize:"14px"}}>الفصل:</label>
        <select value={selectedClass ?? ''} onChange={e => setSelectedClass(Number(e.target.value))}
          style={{padding:"8px 12px",borderRadius:"8px",border:"2px solid #e5e7eb",fontSize:"14px",direction:"rtl",background:"white",cursor:"pointer"}}>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {info && <span style={{background:"#f0fdf4",color:"#16a34a",padding:"5px 14px",borderRadius:"20px",fontWeight:"bold",fontSize:"13px"}}>{info}</span>}
      </div>

      {classes.length === 0 ? (
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <p style={{color:"#6b7280",fontSize:"16px"}}>أنشئ فصلاً أولاً من لوحة الأستاذ 🏫</p>
        </div>
      ) : (
        <>
          {pinnedMsg && (
            <div style={{background:"#fef9c3",borderBottom:"2px solid #fbbf24",padding:"10px 16px",display:"flex",gap:"10px",alignItems:"flex-start",flexShrink:0}}>
              <span style={{fontSize:"18px"}}>📌</span>
              <div style={{flex:1}}>
                <span style={{fontWeight:"bold",color:"#92400e",fontSize:"12px"}}>{names[pinnedMsg.sender_id] || '...'}: </span>
                <span style={{color:"#78350f",fontSize:"14px"}}>{pinnedMsg.content}</span>
              </div>
              <button onClick={() => togglePin(pinnedMsg)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"13px",color:"#92400e",fontWeight:"bold"}}>إلغاء ✕</button>
            </div>
          )}

          <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:"10px"}}>
            {messages.length === 0 && (
              <p style={{textAlign:"center",color:"#9ca3af",marginTop:"40px",fontSize:"15px"}}>لا توجد رسائل بعد — افتتح النقاش برسالة ترحيب! 💬</p>
            )}
            {messages.map(m => {
              const mine = m.sender_id === me.id
              return (
                <div key={m.id} style={{maxWidth:"82%",alignSelf: mine ? "flex-start" : "flex-end"}}>
                  <div style={{
                    background: mine ? "#fefce8" : "white",
                    border: mine ? "2px solid #fbbf24" : "1px solid #e5e7eb",
                    borderRadius: mine ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                    padding:"9px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                    {!mine && <div style={{fontWeight:"bold",fontSize:"12px",color:"#2563eb",marginBottom:"3px"}}>{names[m.sender_id] || '...'}</div>}
                    <div style={{fontSize:"14.5px",lineHeight:"1.7",color:"#1e293b",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{m.content}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"5px",gap:"8px"}}>
                      <span style={{fontSize:"10px",color:"#9ca3af"}}>{fmtTime(m.created_at)}</span>
                      <div style={{display:"flex",gap:"6px"}}>
                        <button onClick={() => togglePin(m)} title={m.pinned ? "إلغاء التثبيت" : "تثبيت"}
                          style={{background:"#fef9c3",border:"none",borderRadius:"6px",padding:"2px 7px",cursor:"pointer",fontSize:"12px"}}>📌</button>
                        <button onClick={() => deleteMsg(m.id)} title="حذف"
                          style={{background:"#fee2e2",border:"none",borderRadius:"6px",padding:"2px 7px",cursor:"pointer",fontSize:"12px"}}>🗑️</button>
                        {!mine && (
                          <>
                            <button onClick={() => mute(m.sender_id, 1)} title="كتم ساعة"
                              style={{background:"#f3f4f6",border:"none",borderRadius:"6px",padding:"2px 7px",cursor:"pointer",fontSize:"11px",fontWeight:"bold",color:"#6b7280"}}>🔇 1س</button>
                            <button onClick={() => mute(m.sender_id, 24)} title="كتم يوماً"
                              style={{background:"#f3f4f6",border:"none",borderRadius:"6px",padding:"2px 7px",cursor:"pointer",fontSize:"11px",fontWeight:"bold",color:"#6b7280"}}>🔇 24س</button>
                          </>
                        )}
                      </div>
                    </div>
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
                placeholder="اكتب رسالة أو إعلاناً لتلاميذك..."
                maxLength={1000}
                style={{flex:1,padding:"12px 16px",borderRadius:"24px",border:"2px solid #e5e7eb",fontSize:"15px",fontFamily:"Arial",direction:"rtl",outline:"none",background:"#f9fafb"}}
              />
              <button onClick={send} disabled={sending}
                style={{background:"#16a34a",color:"white",border:"none",borderRadius:"50%",width:"46px",height:"46px",cursor:"pointer",fontSize:"18px",flexShrink:0}}>
                {sending ? '⏳' : '📤'}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}