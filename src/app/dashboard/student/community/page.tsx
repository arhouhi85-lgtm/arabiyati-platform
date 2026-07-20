'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { isQuietHours, containsBanned, CHARTER, QUIET_START, QUIET_END } from '@/lib/chatRules'

export default function StudentCommunityPage() {
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<any>(null)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [names, setNames] = useState<{[id:string]: string}>({})
  const [messages, setMessages] = useState<any[]>([])
  const [pinnedMsg, setPinnedMsg] = useState<any>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [needCharter, setNeedCharter] = useState(false)
  const [mutedUntil, setMutedUntil] = useState<Date | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const quiet = isQuietHours()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { window.location.href = '/auth/login'; return }
      const { data: my } = await supabase.from('users').select('id, name, class_id').eq('id', session.user.id).single()
      if (!my?.class_id) { setMe({ noClass: true }); setLoading(false); return }
      setMe(my)

      // معلم الفصل
      const { data: cls } = await supabase.from('classes').select('teacher_id').eq('id', my.class_id).single()
      if (cls?.teacher_id) setTeacherId(cls.teacher_id)

      // أسماء أعضاء الفصل
      const { data: members } = await supabase.from('users').select('id, name').eq('class_id', my.class_id)
      const map: {[id:string]: string} = {}
      ;(members || []).forEach((u: any) => { map[u.id] = u.name })
      if (cls?.teacher_id) {
        const { data: t } = await supabase.from('users').select('id, name').eq('id', cls.teacher_id).single()
        map[cls.teacher_id] = t?.name || 'الأستاذ(ة)'
      }
      setNames(map)

      // الميثاق
      const { data: charter } = await supabase.from('charter_agreements').select('student_id').eq('student_id', my.id).maybeSingle()
      if (!charter) setNeedCharter(true)

      // الكتم
      const { data: mute } = await supabase.from('muted_students').select('muted_until').eq('student_id', my.id).eq('class_id', my.class_id).maybeSingle()
      if (mute && new Date(mute.muted_until) > new Date()) setMutedUntil(new Date(mute.muted_until))

      await loadMessages(my.class_id)
      setLoading(false)
    }
    init()
  }, [])

  const loadMessages = async (classId: number) => {
    const { data } = await supabase
      .from('messages')
      .select('id, created_at, sender_id, content, pinned')
      .eq('class_id', classId)
      .is('recipient_id', null)
      .eq('deleted', false)
      .order('created_at', { ascending: true })
      .limit(150)
    setMessages(data || [])
    const pinned = (data || []).filter((m: any) => m.pinned)
    setPinnedMsg(pinned.length > 0 ? pinned[pinned.length - 1] : null)
  }

  // تحديث تلقائي كل 4 ثوانٍ
  useEffect(() => {
    if (!me?.class_id) return
    const iv = setInterval(() => loadMessages(me.class_id), 4000)
    return () => clearInterval(iv)
  }, [me])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  const agreeCharter = async () => {
    await supabase.from('charter_agreements').insert({ student_id: me.id })
    setNeedCharter(false)
  }

  const send = async () => {
    const content = text.trim()
    if (!content || sending) return
    setError('')
    if (quiet) { setError(`مجتمع المعرفة نائم الآن 😴 — يُفتح على الساعة ${QUIET_END} صباحاً`); return }
    if (mutedUntil && mutedUntil > new Date()) {
      setError(`لا يمكنك المشاركة حالياً — راجع أستاذك (حتى ${mutedUntil.toLocaleTimeString('ar-MA', {hour:'2-digit',minute:'2-digit'})})`)
      return
    }
    if (containsBanned(content)) { setError('رسالتك تحتوي كلمة غير مناسبة لمجتمعنا 🚫 — أعد صياغتها بأدب') ; return }
    setSending(true)
    const { error: err } = await supabase.from('messages').insert({ class_id: me.class_id, sender_id: me.id, content })
    if (err) setError('تعذر الإرسال، حاول مجدداً')
    else { setText(''); await loadMessages(me.class_id) }
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

  if (me?.noClass) return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",background:"white",borderRadius:"16px",padding:"40px",maxWidth:"400px"}}>
        <div style={{fontSize:"56px",marginBottom:"12px"}}>🏫</div>
        <p style={{color:"#6b7280",fontSize:"16px",lineHeight:"1.9"}}>مجتمع المعرفة خاص بتلاميذ الفصل الواحد.<br/>اطلب رمز الفصل من أستاذك وانضم من لوحتك أولاً.</p>
        <a href="/dashboard/student"><button style={{background:"#2563eb",color:"white",border:"none",padding:"12px 24px",borderRadius:"8px",cursor:"pointer",marginTop:"16px",fontWeight:"bold"}}>العودة للوحة</button></a>
      </div>
    </main>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial",display:"flex",flexDirection:"column"}}>

      {/* الميثاق */}
      {needCharter && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"16px"}}>
          <div style={{background:"white",borderRadius:"20px",padding:"28px",maxWidth:"460px",maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{textAlign:"center",marginBottom:"14px"}}>
              <div style={{fontSize:"44px"}}>📜</div>
              <h2 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",margin:"6px 0"}}>ميثاق مجتمع المعرفة</h2>
              <p style={{color:"#6b7280",fontSize:"13px",margin:0}}>اقرأ القواعد جيداً قبل المشاركة</p>
            </div>
            {CHARTER.map((c, i) => (
              <div key={i} style={{display:"flex",gap:"8px",marginBottom:"10px",alignItems:"flex-start"}}>
                <span style={{color:"#16a34a",fontWeight:"bold"}}>✓</span>
                <p style={{margin:0,fontSize:"14px",color:"#374151",lineHeight:"1.8"}}>{c}</p>
              </div>
            ))}
            <button onClick={agreeCharter}
              style={{width:"100%",background:"#16a34a",color:"white",border:"none",padding:"14px",borderRadius:"10px",fontSize:"16px",fontWeight:"bold",cursor:"pointer",marginTop:"10px"}}>
              قرأتُ الميثاق وأوافق عليه ✓
            </button>
          </div>
        </div>
      )}

      {/* الترويسة بالصورة */}
      <div style={{position:"relative",height:"140px",overflow:"hidden",flexShrink:0}}>
        <img src="/images/community.jpg" alt="مجتمع المعرفة" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(30,58,138,0.55),rgba(30,58,138,0.75))",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <h1 style={{color:"white",fontSize:"26px",fontWeight:"bold",margin:0,textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>🌐 مجتمع المعرفة</h1>
          <p style={{color:"#dbeafe",fontSize:"13px",margin:"4px 0 0 0"}}>نتناقش، نتساءل، نتعلم معاً</p>
        </div>
        <a href="/dashboard/student" style={{position:"absolute",top:"12px",left:"12px",background:"rgba(255,255,255,0.92)",color:"#1e3a8a",padding:"7px 14px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold",fontSize:"13px"}}>
          ← العودة
        </a>
      </div>

      {/* الرسالة المثبتة */}
      {pinnedMsg && (
        <div style={{background:"#fef9c3",borderBottom:"2px solid #fbbf24",padding:"10px 16px",display:"flex",gap:"10px",alignItems:"flex-start",flexShrink:0}}>
          <span style={{fontSize:"18px"}}>📌</span>
          <div>
            <span style={{fontWeight:"bold",color:"#92400e",fontSize:"12px"}}>{names[pinnedMsg.sender_id] || '...'}: </span>
            <span style={{color:"#78350f",fontSize:"14px"}}>{pinnedMsg.content}</span>
          </div>
        </div>
      )}

      {/* الهدوء الليلي */}
      {quiet && (
        <div style={{background:"#e0e7ff",borderBottom:"1px solid #c7d2fe",padding:"10px 16px",textAlign:"center",color:"#3730a3",fontWeight:"bold",fontSize:"14px",flexShrink:0}}>
          🌙 مجتمع المعرفة نائم الآن — يمكنك القراءة، والمشاركة تعود على الساعة {QUIET_END} صباحاً. تصبح على خير! 😴
        </div>
      )}

      {/* الرسائل */}
      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:"10px"}}>
        {messages.length === 0 && (
          <p style={{textAlign:"center",color:"#9ca3af",marginTop:"40px",fontSize:"15px"}}>لا توجد رسائل بعد — كن أول من يبدأ النقاش! 💬</p>
        )}
        {messages.map(m => {
          const mine = m.sender_id === me.id
          const isTeacher = m.sender_id === teacherId
          return (
            <div key={m.id} style={{maxWidth:"78%",alignSelf: mine ? "flex-start" : "flex-end"}}>
              <div style={{
                background: mine ? "#2563eb" : (isTeacher ? "#fefce8" : "white"),
                color: mine ? "white" : "#1e293b",
                border: isTeacher ? "2px solid #fbbf24" : "1px solid #e5e7eb",
                borderRadius: mine ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                padding:"9px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                {!mine && (
                  <div style={{fontWeight:"bold",fontSize:"12px",color: isTeacher ? "#a16207" : "#2563eb",marginBottom:"3px"}}>
                    {isTeacher && "👨‍🏫 "}{names[m.sender_id] || '...'}
                  </div>
                )}
                <div style={{fontSize:"14.5px",lineHeight:"1.7",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{m.content}</div>
                <div style={{fontSize:"10px",color: mine ? "#bfdbfe" : "#9ca3af",marginTop:"4px",textAlign:"left"}}>{fmtTime(m.created_at)}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      {/* الإدخال */}
      <div style={{background:"white",borderTop:"1px solid #e5e7eb",padding:"12px 16px",flexShrink:0}}>
        {error && <p style={{color:"#dc2626",fontSize:"13px",fontWeight:"bold",margin:"0 0 8px 0",textAlign:"center"}}>{error}</p>}
        <div style={{display:"flex",gap:"10px"}}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder={quiet ? "المجتمع مقفل ليلاً 🌙" : "اكتب رسالتك هنا... (نص فقط)"}
            disabled={quiet || needCharter}
            maxLength={1000}
            style={{flex:1,padding:"12px 16px",borderRadius:"24px",border:"2px solid #e5e7eb",fontSize:"15px",fontFamily:"Arial",direction:"rtl",outline:"none",background: quiet ? "#f3f4f6" : "#f9fafb"}}
          />
          <button onClick={send} disabled={sending || quiet || needCharter}
            style={{background:"#2563eb",color:"white",border:"none",borderRadius:"50%",width:"46px",height:"46px",cursor:"pointer",fontSize:"18px",flexShrink:0,opacity: (quiet||needCharter) ? 0.5 : 1}}>
            {sending ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </main>
  )
}