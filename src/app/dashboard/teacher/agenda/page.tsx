'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getUpcomingEvents, daysUntil, fmtDate, fmtRange, TYPE_LABELS, TYPE_COLORS, CalendarEvent } from '@/lib/calendarEvents'

export default function TeacherAgendaPage() {
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<any>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [noteDate, setNoteDate] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all'|'holiday'|'exam'|'day'|'note'>('all')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { window.location.href = '/auth/login'; return }
      setMe(session.user)
      await loadNotes(session.user.id)
      setLoading(false)
    }
    init()
  }, [])

  const loadNotes = async (teacherId: string) => {
    const { data } = await supabase.from('teacher_notes').select('*').eq('teacher_id', teacherId).order('date')
    setNotes(data || [])
  }

  const addNote = async () => {
    if (!noteDate || !noteTitle.trim() || !me) return
    setSaving(true)
    await supabase.from('teacher_notes').insert({ teacher_id: me.id, date: noteDate, title: noteTitle.trim() })
    setNoteDate(''); setNoteTitle(''); setShowAdd(false)
    await loadNotes(me.id)
    setSaving(false)
  }

  const deleteNote = async (id: number) => {
    await supabase.from('teacher_notes').delete().eq('id', id)
    await loadNotes(me.id)
  }

  if (loading) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  // دمج الأحداث الرسمية مع الملاحظات الشخصية في قائمة موحدة
  const officialEvents = getUpcomingEvents(new Date(), 200)
  type Item = { date: Date, endDate?: Date, title: string, type: string, icon: string, approx?: boolean, noteId?: number }
  const noteItems: Item[] = notes
    .filter(n => new Date(n.date) >= new Date(new Date().toDateString()))
    .map(n => ({ date: new Date(n.date), title: n.title, type: 'note', icon: '📌', noteId: n.id }))
  let items: Item[] = [...officialEvents, ...noteItems].sort((a,b) => a.date.getTime() - b.date.getTime())
  if (filter !== 'all') items = items.filter(i => i.type === filter)

  const nextItem = items[0]

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",flexWrap:"wrap",gap:"8px"}}>
        <h1 style={{color:"#0891b2",fontSize:"22px",fontWeight:"bold",margin:0}}>📅 المفكرة</h1>
        <a href="/dashboard/teacher" style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
          العودة للوحة
        </a>
      </nav>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>

        {/* المحطة القادمة */}
        {nextItem && (
          <div style={{background:"linear-gradient(135deg,#0891b2,#0e7490)",borderRadius:"16px",padding:"22px",marginBottom:"20px",color:"white",boxShadow:"0 4px 16px rgba(8,145,178,0.3)"}}>
            <p style={{margin:"0 0 6px 0",fontSize:"13px",opacity:0.9}}>⏳ المحطة القادمة</p>
            <h2 style={{margin:"0 0 6px 0",fontSize:"22px",fontWeight:"bold"}}>{nextItem.icon} {nextItem.title}</h2>
            <p style={{margin:0,fontSize:"14px",opacity:0.95}}>
              {fmtRange(nextItem as CalendarEvent)} — {daysUntil(nextItem.date) === 0 ? 'اليوم!' : daysUntil(nextItem.date) === 1 ? 'غداً' : `بعد ${daysUntil(nextItem.date)} يوماً`}
            </p>
          </div>
        )}

        {/* أدوات: إضافة ملاحظة + الفلترة */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {[["all","الكل"],["holiday","العطل"],["exam","الامتحانات"],["day","المناسبات"],["note","ملاحظاتي"]].map(([k,l]) => (
              <button key={k} onClick={()=>setFilter(k as any)}
                style={{padding:"7px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontWeight:"bold",fontSize:"13px",
                  background: filter===k ? "#0891b2" : "white", color: filter===k ? "white" : "#374151",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowAdd(true)}
            style={{background:"#16a34a",color:"white",border:"none",padding:"9px 18px",borderRadius:"10px",fontWeight:"bold",fontSize:"13px",cursor:"pointer"}}>
            + إضافة ملاحظة
          </button>
        </div>

        {/* نافذة إضافة ملاحظة */}
        {showAdd && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"16px"}}>
            <div style={{background:"white",borderRadius:"16px",padding:"24px",maxWidth:"380px",width:"100%"}}>
              <h3 style={{color:"#0891b2",fontSize:"18px",fontWeight:"bold",marginBottom:"16px"}}>📌 ملاحظة جديدة</h3>
              <label style={{display:"block",fontSize:"13px",fontWeight:"bold",color:"#374151",marginBottom:"6px"}}>التاريخ</label>
              <input type="date" value={noteDate} onChange={e=>setNoteDate(e.target.value)}
                style={{width:"100%",padding:"10px",borderRadius:"8px",border:"2px solid #e5e7eb",marginBottom:"14px",boxSizing:"border-box"}}/>
              <label style={{display:"block",fontSize:"13px",fontWeight:"bold",color:"#374151",marginBottom:"6px"}}>العنوان (لقاء، موعد تسليم واجب...)</label>
              <input value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="مثال: لقاء أولياء الأمور"
                style={{width:"100%",padding:"10px",borderRadius:"8px",border:"2px solid #e5e7eb",marginBottom:"18px",boxSizing:"border-box",direction:"rtl"}}/>
              <div style={{display:"flex",gap:"10px"}}>
                <button onClick={addNote} disabled={saving || !noteDate || !noteTitle.trim()}
                  style={{flex:1,background:"#16a34a",color:"white",border:"none",padding:"11px",borderRadius:"8px",fontWeight:"bold",cursor:"pointer",opacity:(!noteDate||!noteTitle.trim())?0.5:1}}>
                  {saving ? 'جارٍ الحفظ...' : 'حفظ ✓'}
                </button>
                <button onClick={()=>{setShowAdd(false);setNoteDate('');setNoteTitle('')}}
                  style={{flex:1,background:"#f3f4f6",color:"#6b7280",border:"none",padding:"11px",borderRadius:"8px",fontWeight:"bold",cursor:"pointer"}}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* القائمة */}
        <div style={{background:"white",borderRadius:"16px",padding:"8px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
          {items.length === 0 ? (
            <p style={{textAlign:"center",color:"#9ca3af",padding:"30px",fontSize:"15px"}}>لا توجد أحداث في هذا التصنيف</p>
          ) : items.map((item, idx) => {
            const colors = TYPE_COLORS[item.type] || { bg:"#f3f4f6", color:"#374151", border:"#e5e7eb" }
            const dleft = daysUntil(item.date)
            return (
              <div key={idx} style={{display:"flex",alignItems:"center",gap:"12px",padding:"13px 14px",
                borderBottom: idx < items.length-1 ? "1px solid #f3f4f6" : "none"}}>
                <span style={{fontSize:"26px",flexShrink:0}}>{item.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:"bold",color:"#1e293b",fontSize:"15px"}}>
                    {item.title}
                    {item.approx && <span style={{color:"#ca8a04",fontSize:"11px",fontWeight:"normal"}}> (⚠️ تاريخ تقريبي)</span>}
                  </div>
                  <div style={{color:"#9ca3af",fontSize:"12.5px"}}>{fmtRange(item as CalendarEvent)}</div>
                </div>
                <span style={{background:colors.bg,color:colors.color,border:`1px solid ${colors.border}`,padding:"4px 10px",borderRadius:"14px",fontSize:"11px",fontWeight:"bold",flexShrink:0}}>
                  {dleft === 0 ? "اليوم" : dleft === 1 ? "غداً" : `${dleft} يوم`}
                </span>
                {item.noteId && (
                  <button onClick={()=>deleteNote(item.noteId!)} title="حذف"
                    style={{background:"#fee2e2",border:"none",borderRadius:"6px",padding:"5px 9px",cursor:"pointer",fontSize:"13px",flexShrink:0}}>🗑️</button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}