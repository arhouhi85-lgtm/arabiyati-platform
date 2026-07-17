'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const STATUS_CONFIG: {[key:string]:{label:string,icon:string,bg:string,color:string,border:string}} = {
  present:          {label:"حاضر",        icon:"✓",  bg:"#f0fdf4", color:"#16a34a", border:"#86efac"},
  late:             {label:"متأخر",       icon:"⏰", bg:"#fef9c3", color:"#ca8a04", border:"#fbbf24"},
  absent_excused:   {label:"غياب مبرَّر",  icon:"📝", bg:"#eff6ff", color:"#2563eb", border:"#93c5fd"},
  absent_unexcused: {label:"غياب غير مبرَّر", icon:"❌", bg:"#fee2e2", color:"#dc2626", border:"#fca5a5"},
}
const STATUS_KEYS = ["present","late","absent_excused","absent_unexcused"]

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function TeacherAttendancePage() {
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [date, setDate] = useState(todayISO())
  const [session, setSession] = useState<'morning'|'evening'>('morning')
  const [students, setStudents] = useState<any[]>([])
  const [statuses, setStatuses] = useState<{[studentId:string]:string}>({})
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession?.user) { window.location.href = '/auth/login'; return }
      const { data: cls } = await supabase
        .from('classes')
        .select('id, name, join_code')
        .eq('teacher_id', authSession.user.id)
      setClasses(cls || [])
      if (cls && cls.length > 0) setSelectedClass(cls[0].id)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    const loadStudents = async () => {
      setError('')
      const { data: studs } = await supabase
        .from('users')
        .select('id, name, grade_level')
        .eq('class_id', selectedClass)
        .order('name')
      setStudents(studs || [])

      const { data: records } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', selectedClass)
        .eq('date', date)
        .eq('session', session)

      const map: {[k:string]:string} = {}
      ;(studs || []).forEach((s:any) => { map[s.id] = 'present' })
      ;(records || []).forEach((r:any) => { map[r.student_id] = r.status })
      setStatuses(map)
      setSavedMsg('')
    }
    loadStudents()
  }, [selectedClass, date, session])

  const setStudentStatus = (studentId: string, status: string) => {
    setStatuses(prev => ({ ...prev, [studentId]: status }))
    setSavedMsg('')
  }

  const handleSave = async () => {
    if (!selectedClass) return
    setSaving(true)
    setError('')

    const { error: delError } = await supabase
      .from('attendance')
      .delete()
      .eq('class_id', selectedClass)
      .eq('date', date)
      .eq('session', session)

    if (delError) {
      setError('تعذر الحفظ، حاول مجدداً')
      setSaving(false)
      return
    }

    const rows = students
      .filter(s => statuses[s.id] && statuses[s.id] !== 'present')
      .map(s => ({
        student_id: s.id,
        class_id: selectedClass,
        date,
        session,
        status: statuses[s.id],
      }))

    if (rows.length > 0) {
      const { error: insError } = await supabase.from('attendance').insert(rows)
      if (insError) {
        setError('تعذر الحفظ، حاول مجدداً')
        setSaving(false)
        return
      }
    }
    await supabase
      .from('attendance_sessions')
      .upsert({ class_id: selectedClass, date, session }, { onConflict: 'class_id,date,session' })

    setSavedMsg(`✅ تم حفظ سجل ${session === 'morning' ? 'الحصة الصباحية' : 'الحصة المسائية'} ليوم ${date}`)
    setSaving(false)
  }

  const counts = {
    present: students.filter(s => statuses[s.id] === 'present').length,
    late: students.filter(s => statuses[s.id] === 'late').length,
    absent_excused: students.filter(s => statuses[s.id] === 'absent_excused').length,
    absent_unexcused: students.filter(s => statuses[s.id] === 'absent_unexcused').length,
  }

  if (loading) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",flexWrap:"wrap",gap:"8px"}}>
        <h1 style={{color:"#16a34a",fontSize:"22px",fontWeight:"bold",margin:0}}>📋 سجل الغياب</h1>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <a href="/dashboard/teacher/attendance/report" style={{background:"#eff6ff",color:"#2563eb",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            📊 التقرير الشهري
          </a>
          <a href="/dashboard/teacher" style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            العودة للوحة
          </a>
        </div>
      </nav>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"24px"}}>

        {classes.length === 0 ? (
          <div style={{background:"white",borderRadius:"16px",padding:"40px",textAlign:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>🏫</div>
            <p style={{color:"#6b7280",fontSize:"17px"}}>لم تنشئ أي فصل بعد. أنشئ فصلاً أولاً من لوحة الأستاذ.</p>
          </div>
        ) : (
          <>
            {/* أدوات الاختيار */}
            <div style={{background:"white",borderRadius:"16px",padding:"20px",marginBottom:"20px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{flex:"1",minWidth:"180px"}}>
                <label style={{display:"block",marginBottom:"6px",fontWeight:"bold",color:"#374151",fontSize:"14px"}}>الفصل</label>
                <select
                  value={selectedClass ?? ''}
                  onChange={e => setSelectedClass(Number(e.target.value))}
                  style={{width:"100%",padding:"10px",borderRadius:"8px",border:"2px solid #e5e7eb",fontSize:"15px",direction:"rtl",background:"white",cursor:"pointer"}}>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{flex:"1",minWidth:"160px"}}>
                <label style={{display:"block",marginBottom:"6px",fontWeight:"bold",color:"#374151",fontSize:"14px"}}>التاريخ</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{width:"100%",padding:"9px",borderRadius:"8px",border:"2px solid #e5e7eb",fontSize:"15px",boxSizing:"border-box"}}
                />
              </div>
              <div>
                <label style={{display:"block",marginBottom:"6px",fontWeight:"bold",color:"#374151",fontSize:"14px"}}>الحصة</label>
                <div style={{display:"flex",gap:"8px"}}>
                  <button onClick={()=>setSession('morning')}
                    style={{padding:"10px 18px",borderRadius:"8px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",
                      border: session==='morning' ? "2px solid #16a34a" : "2px solid #e5e7eb",
                      background: session==='morning' ? "#f0fdf4" : "white",
                      color: session==='morning' ? "#16a34a" : "#6b7280"}}>
                    🌅 صباحية
                  </button>
                  <button onClick={()=>setSession('evening')}
                    style={{padding:"10px 18px",borderRadius:"8px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",
                      border: session==='evening' ? "2px solid #16a34a" : "2px solid #e5e7eb",
                      background: session==='evening' ? "#f0fdf4" : "white",
                      color: session==='evening' ? "#16a34a" : "#6b7280"}}>
                    🌇 مسائية
                  </button>
                </div>
              </div>
            </div>

            {/* ملخص سريع */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"20px"}}>
              {STATUS_KEYS.map(k => (
                <div key={k} style={{background:STATUS_CONFIG[k].bg,border:`1px solid ${STATUS_CONFIG[k].border}`,borderRadius:"12px",padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:"22px",fontWeight:"bold",color:STATUS_CONFIG[k].color}}>{(counts as any)[k]}</div>
                  <div style={{fontSize:"12px",color:STATUS_CONFIG[k].color,fontWeight:"bold"}}>{STATUS_CONFIG[k].icon} {STATUS_CONFIG[k].label}</div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{background:"#fee2e2",color:"#dc2626",padding:"12px",borderRadius:"8px",marginBottom:"16px",textAlign:"center",fontWeight:"bold"}}>
                {error}
              </div>
            )}
            {savedMsg && (
              <div style={{background:"#f0fdf4",color:"#16a34a",padding:"12px",borderRadius:"8px",marginBottom:"16px",textAlign:"center",fontWeight:"bold",border:"1px solid #86efac"}}>
                {savedMsg}
              </div>
            )}

            {/* لائحة التلاميذ */}
            <div style={{background:"white",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
              {students.length === 0 ? (
                <p style={{textAlign:"center",color:"#6b7280",padding:"20px"}}>لا يوجد تلاميذ في هذا الفصل بعد.</p>
              ) : (
                <>
                  {students.map((s, idx) => (
                    <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 8px",
                      borderBottom: idx < students.length-1 ? "1px solid #f3f4f6" : "none",flexWrap:"wrap",gap:"8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"10px",minWidth:"160px"}}>
                        <span style={{background:"#eff6ff",color:"#2563eb",borderRadius:"50%",width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"14px"}}>{idx+1}</span>
                        <div>
                          <div style={{fontWeight:"bold",color:"#1e293b",fontSize:"15px"}}>{s.name}</div>
                          {s.grade_level && <div style={{fontSize:"12px",color:"#9ca3af"}}>المستوى {s.grade_level}</div>}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                        {STATUS_KEYS.map(k => {
                          const active = statuses[s.id] === k
                          const cfg = STATUS_CONFIG[k]
                          return (
                            <button key={k} onClick={()=>setStudentStatus(s.id, k)}
                              title={cfg.label}
                              style={{padding:"8px 12px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"13px",
                                border: active ? `2px solid ${cfg.color}` : "2px solid #e5e7eb",
                                background: active ? cfg.bg : "white",
                                color: active ? cfg.color : "#9ca3af",
                                transition:"all 0.15s"}}>
                              {cfg.icon} {cfg.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{width:"100%",background:"#16a34a",color:"white",border:"none",padding:"14px",borderRadius:"10px",fontSize:"17px",fontWeight:"bold",cursor:"pointer",marginTop:"20px"}}>
                    {saving ? 'جارٍ الحفظ...' : '💾 حفظ السجل'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}