'use client'
// ============================================================
//  سجل الغياب — مربوط بلائحة القسم
//  المكان: src/app/dashboard/teacher/attendance/page.tsx
//
//  • يعرض تلاميذ لائحة القسم (المحفوظة في المتصفّح) بترتيبها
//  • التلميذ المرتبط بحساب  → يُحفظ غيابه في قاعدة البيانات
//  • التلميذ بلا حساب        → يُحفظ غيابه في المتصفّح فقط
//  • إن كانت اللائحة فارغة، يعمل بالحسابات المسجّلة كالسابق
// ============================================================
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import TeacherNav from '@/components/TeacherNav'

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

// مفاتيح التخزين في المتصفّح (نفس مفاتيح صفحة لائحة القسم)
const rosterKey = (classId: number) => `arabiyati_roster_${classId}`
const linksKey  = (classId: number) => `arabiyati_roster_links_${classId}`
const localAttKey = (classId: number, date: string, session: string) =>
  `arabiyati_attendance_${classId}_${date}_${session}`

type Row = {
  rowId: string          // معرّف الصف في الواجهة
  name: string
  userId: string | null  // معرّف الحساب إن وُجد (للحفظ في قاعدة البيانات)
  massar?: string
  gradeLevel?: string | null
  inRoster: boolean
}

export default function TeacherAttendancePage() {
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [date, setDate] = useState(todayISO())
  const [session, setSession] = useState<'morning'|'evening'>('morning')
  const [rows, setRows] = useState<Row[]>([])
  const [rosterCount, setRosterCount] = useState(0)
  const [statuses, setStatuses] = useState<{[rowId:string]:string}>({})
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

      // 1) الحسابات المسجّلة في هذا الفصل
      const { data: studs } = await supabase
        .from('users')
        .select('id, name, grade_level')
        .eq('class_id', selectedClass)
        .order('name')
      const accounts = studs || []

      // 2) لائحة القسم اليدوية + الروابط (من المتصفّح)
      let roster: any[] = []
      let links: {[userId:string]: string} = {}
      try {
        const r = localStorage.getItem(rosterKey(selectedClass))
        roster = r ? JSON.parse(r) : []
      } catch { roster = [] }
      try {
        const l = localStorage.getItem(linksKey(selectedClass))
        links = l ? JSON.parse(l) : {}
      } catch { links = {} }
      setRosterCount(roster.length)

      // خريطة معكوسة: معرّف تلميذ اللائحة → الحساب المرتبط
      const accountByRosterId: {[rosterId:string]: any} = {}
      for (const acc of accounts) {
        const rid = links[acc.id]
        if (rid) accountByRosterId[rid] = acc
      }

      // 3) بناء الصفوف
      const built: Row[] = []
      if (roster.length > 0) {
        // اللائحة اليدوية هي المرجع (بترتيبها)
        for (const st of roster) {
          const acc = accountByRosterId[st.id]
          built.push({
            rowId: `r_${st.id}`,
            name: st.fullName,
            userId: acc ? acc.id : null,
            massar: st.massar,
            gradeLevel: acc ? acc.grade_level : null,
            inRoster: true,
          })
        }
        // حسابات مسجّلة غير مرتبطة بأي اسم في اللائحة → تُضاف في الآخر
        const linkedIds = new Set(Object.keys(accountByRosterId).map(k => accountByRosterId[k].id))
        for (const acc of accounts) {
          if (!linkedIds.has(acc.id)) {
            built.push({
              rowId: `u_${acc.id}`,
              name: acc.name,
              userId: acc.id,
              gradeLevel: acc.grade_level,
              inRoster: false,
            })
          }
        }
      } else {
        // لا لائحة يدوية → السلوك القديم تماماً
        for (const acc of accounts) {
          built.push({
            rowId: `u_${acc.id}`,
            name: acc.name,
            userId: acc.id,
            gradeLevel: acc.grade_level,
            inRoster: false,
          })
        }
      }
      setRows(built)

      // 4) الحالات المحفوظة: من قاعدة البيانات + من المتصفّح
      const map: {[k:string]:string} = {}
      built.forEach(r => { map[r.rowId] = 'present' })

      const { data: records } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', selectedClass)
        .eq('date', date)
        .eq('session', session)
      const byUserId: {[uid:string]:string} = {}
      ;(records || []).forEach((r:any) => { byUserId[r.student_id] = r.status })
      built.forEach(r => {
        if (r.userId && byUserId[r.userId]) map[r.rowId] = byUserId[r.userId]
      })

      try {
        const raw = localStorage.getItem(localAttKey(selectedClass, date, session))
        const local = raw ? JSON.parse(raw) : {}
        for (const k of Object.keys(local)) {
          if (map[k] !== undefined) map[k] = local[k]
        }
      } catch { /* تجاهل */ }

      setStatuses(map)
      setSavedMsg('')
    }
    loadStudents()
  }, [selectedClass, date, session])

  const setStudentStatus = (rowId: string, status: string) => {
    setStatuses(prev => ({ ...prev, [rowId]: status }))
    setSavedMsg('')
  }

  const markAllPresent = () => {
    const m: {[k:string]:string} = {}
    rows.forEach(r => { m[r.rowId] = 'present' })
    setStatuses(m)
    setSavedMsg('')
  }

  const handleSave = async () => {
    if (!selectedClass) return
    setSaving(true)
    setError('')

    // (أ) الحفظ في المتصفّح لتلاميذ اللائحة بلا حساب
    try {
      const localMap: {[k:string]:string} = {}
      rows.filter(r => !r.userId).forEach(r => {
        localMap[r.rowId] = statuses[r.rowId] || 'present'
      })
      localStorage.setItem(localAttKey(selectedClass, date, session), JSON.stringify(localMap))
    } catch { /* تجاهل */ }

    // (ب) الحفظ في قاعدة البيانات للتلاميذ ذوي الحسابات
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

    const dbRows = rows
      .filter(r => r.userId && statuses[r.rowId] && statuses[r.rowId] !== 'present')
      .map(r => ({
        student_id: r.userId,
        class_id: selectedClass,
        date,
        session,
        status: statuses[r.rowId],
      }))

    if (dbRows.length > 0) {
      const { error: insError } = await supabase.from('attendance').insert(dbRows)
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
    present: rows.filter(r => statuses[r.rowId] === 'present').length,
    late: rows.filter(r => statuses[r.rowId] === 'late').length,
    absent_excused: rows.filter(r => statuses[r.rowId] === 'absent_excused').length,
    absent_unexcused: rows.filter(r => statuses[r.rowId] === 'absent_unexcused').length,
  }

  if (loading) return (
    <>
      <TeacherNav active="attendance" />
      <div dir="rtl" style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
        <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
      </div>
    </>
  )

  return (
    <>
      <TeacherNav active="attendance" />
      <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>

        <div style={{maxWidth:"900px",margin:"0 auto",padding:"24px"}}>

          {/* عنوان الصفحة + روابط فرعية */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"10px"}}>
            <h2 style={{color:"#16a34a",fontSize:"22px",fontWeight:"bold",margin:0}}>📋 سجل الغياب</h2>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              <a href="/dashboard/teacher/attendance/report" style={{background:"#eff6ff",color:"#2563eb",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
                📊 التقرير الشهري
              </a>
              <a href="/dashboard/teacher/roster" style={{background:"#f5efe3",color:"#B08D51",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
                👥 تعديل اللائحة
              </a>
            </div>
          </div>

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

              {/* تنبيه إن كانت اللائحة فارغة */}
              {rosterCount === 0 && (
                <div style={{background:"#fffbeb",border:"1px solid #fcd34d",color:"#92400e",padding:"12px 16px",borderRadius:"10px",marginBottom:"20px",fontSize:"14px"}}>
                  💡 لم تُدخل لائحة هذا القسم بعد، لذا يظهر هنا التلاميذ أصحاب الحسابات فقط.{' '}
                  <a href="/dashboard/teacher/roster" style={{color:"#B08D51",fontWeight:"bold"}}>أدخل اللائحة</a>{' '}
                  ليشمل السجل كل تلاميذ القسم.
                </div>
              )}

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
                {rows.length === 0 ? (
                  <p style={{textAlign:"center",color:"#6b7280",padding:"20px"}}>
                    لا يوجد تلاميذ في هذا الفصل بعد.
                  </p>
                ) : (
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
                      <span style={{color:"#6b7280",fontSize:"14px"}}>عدد التلاميذ: <strong>{rows.length}</strong></span>
                      <button onClick={markAllPresent}
                        style={{background:"#f0fdf4",color:"#16a34a",border:"2px solid #86efac",padding:"7px 14px",borderRadius:"8px",fontWeight:"bold",fontSize:"13px",cursor:"pointer"}}>
                        ✓ تعيين الجميع حاضرين
                      </button>
                    </div>

                    {rows.map((r, idx) => (
                      <div key={r.rowId} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 8px",
                        borderBottom: idx < rows.length-1 ? "1px solid #f3f4f6" : "none",flexWrap:"wrap",gap:"8px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"10px",minWidth:"180px"}}>
                          <span style={{background:"#eff6ff",color:"#2563eb",borderRadius:"50%",width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"14px"}}>{idx+1}</span>
                          <div>
                            <div style={{fontWeight:"bold",color:"#1e293b",fontSize:"15px"}}>
                              {r.name}
                              {r.userId && <span title="مرتبط بحساب رقمي" style={{color:"#16a34a",fontSize:"12px",marginRight:"6px"}}>●</span>}
                            </div>
                            <div style={{fontSize:"12px",color:"#9ca3af"}}>
                              {r.massar ? `مسار: ${r.massar}` : (r.gradeLevel ? `المستوى ${r.gradeLevel}` : '')}
                              {!r.inRoster && rosterCount > 0 && <span style={{color:"#d97706"}}> • خارج اللائحة</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                          {STATUS_KEYS.map(k => {
                            const active = statuses[r.rowId] === k
                            const cfg = STATUS_CONFIG[k]
                            return (
                              <button key={k} onClick={()=>setStudentStatus(r.rowId, k)}
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
    </>
  )
}