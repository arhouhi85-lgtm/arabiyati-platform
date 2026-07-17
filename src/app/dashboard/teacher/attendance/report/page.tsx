'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const MONTHS = ["يناير","فبراير","مارس","أبريل","ماي","يونيو","يوليوز","غشت","شتنبر","أكتوبر","نونبر","دجنبر"]

function currentMonthISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

function monthLabel(iso: string) {
  const [y, m] = iso.split('-')
  return `${MONTHS[Number(m)-1]} ${y}`
}

function lastDayOfMonth(iso: string) {
  const [y, m] = iso.split('-').map(Number)
  return `${iso}-${String(new Date(y, m, 0).getDate()).padStart(2,'0')}`
}

export default function AttendanceReportPage() {
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [month, setMonth] = useState(currentMonthISO())
  const [students, setStudents] = useState<any[]>([])
  const [totalSessions, setTotalSessions] = useState(0)
  const [stats, setStats] = useState<{[studentId:string]:{late:number,exc:number,unexc:number}}>({})

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { window.location.href = '/auth/login'; return }
      const { data: cls } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', session.user.id)
      setClasses(cls || [])
      if (cls && cls.length > 0) setSelectedClass(cls[0].id)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    const loadReport = async () => {
      const from = `${month}-01`
      const to = lastDayOfMonth(month)

      const { data: studs } = await supabase
        .from('users')
        .select('id, name, grade_level')
        .eq('class_id', selectedClass)
        .order('name')
      setStudents(studs || [])

      const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select('id')
        .eq('class_id', selectedClass)
        .gte('date', from)
        .lte('date', to)
      setTotalSessions((sessions || []).length)

      const { data: records } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', selectedClass)
        .gte('date', from)
        .lte('date', to)

      const map: {[k:string]:{late:number,exc:number,unexc:number}} = {}
      ;(studs || []).forEach((s:any) => { map[s.id] = {late:0, exc:0, unexc:0} })
      ;(records || []).forEach((r:any) => {
        if (!map[r.student_id]) return
        if (r.status === 'late') map[r.student_id].late++
        if (r.status === 'absent_excused') map[r.student_id].exc++
        if (r.status === 'absent_unexcused') map[r.student_id].unexc++
      })
      setStats(map)
    }
    loadReport()
  }, [selectedClass, month])

  const presenceRate = (s: any) => {
    if (totalSessions === 0) return 100
    const st = stats[s.id] || {late:0, exc:0, unexc:0}
    const absences = st.exc + st.unexc
    return Math.max(0, Math.round(((totalSessions - absences) / totalSessions) * 100))
  }

  const classTotals = students.reduce((acc, s) => {
    const st = stats[s.id] || {late:0, exc:0, unexc:0}
    acc.late += st.late; acc.exc += st.exc; acc.unexc += st.unexc
    return acc
  }, {late:0, exc:0, unexc:0})

  const classPresence = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + presenceRate(s), 0) / students.length)
    : 100

  const className = classes.find(c => c.id === selectedClass)?.name || ''

  if (loading) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          main { background: white !important; }
          .print-area { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <nav className="no-print" style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",flexWrap:"wrap",gap:"8px"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>📊 التقرير الشهري للحضور والغياب</h1>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <a href="/dashboard/teacher/attendance" style={{background:"#f0fdf4",color:"#16a34a",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            📋 سجل الغياب
          </a>
          <a href="/dashboard/teacher" style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            العودة للوحة
          </a>
        </div>
      </nav>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"24px"}}>

        {classes.length === 0 ? (
          <div style={{background:"white",borderRadius:"16px",padding:"40px",textAlign:"center"}}>
            <p style={{color:"#6b7280",fontSize:"17px"}}>لم تنشئ أي فصل بعد.</p>
          </div>
        ) : (
          <>
            {/* أدوات الاختيار + زر الطباعة */}
            <div className="no-print" style={{background:"white",borderRadius:"16px",padding:"20px",marginBottom:"20px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"flex-end"}}>
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
                <label style={{display:"block",marginBottom:"6px",fontWeight:"bold",color:"#374151",fontSize:"14px"}}>الشهر</label>
                <input
                  type="month"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  style={{width:"100%",padding:"9px",borderRadius:"8px",border:"2px solid #e5e7eb",fontSize:"15px",boxSizing:"border-box"}}
                />
              </div>
              <button
                onClick={() => window.print()}
                style={{background:"#2563eb",color:"white",border:"none",padding:"12px 24px",borderRadius:"8px",fontSize:"15px",fontWeight:"bold",cursor:"pointer"}}>
                🖨️ طباعة اللائحة
              </button>
            </div>

            {/* منطقة الطباعة */}
            <div className="print-area" style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>

              {/* ترويسة التقرير */}
              <div style={{textAlign:"center",marginBottom:"20px",borderBottom:"2px solid #1e3a8a",paddingBottom:"14px"}}>
                <h2 style={{color:"#1e3a8a",fontSize:"22px",fontWeight:"bold",margin:"0 0 6px 0"}}>منصة عربيتي — تقرير الحضور والغياب الشهري</h2>
                <p style={{color:"#374151",fontSize:"16px",margin:"0",fontWeight:"bold"}}>
                  الفصل: {className} &nbsp;|&nbsp; شهر: {monthLabel(month)} &nbsp;|&nbsp; عدد الحصص المسجَّلة: {totalSessions}
                </p>
              </div>

              {totalSessions === 0 ? (
                <p style={{textAlign:"center",color:"#6b7280",padding:"24px",fontSize:"16px"}}>
                  لا توجد حصص مسجَّلة في هذا الشهر بعد. سجّل الغياب من صفحة «سجل الغياب» أولاً.
                </p>
              ) : (
                <>
                  {/* الجدول */}
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:"14px"}}>
                    <thead>
                      <tr style={{background:"#eff6ff"}}>
                        <th style={{border:"1px solid #cbd5e1",padding:"10px",color:"#1e3a8a"}}>#</th>
                        <th style={{border:"1px solid #cbd5e1",padding:"10px",color:"#1e3a8a",textAlign:"right"}}>اسم التلميذ(ة)</th>
                        <th style={{border:"1px solid #cbd5e1",padding:"10px",color:"#ca8a04"}}>⏰ تأخر</th>
                        <th style={{border:"1px solid #cbd5e1",padding:"10px",color:"#2563eb"}}>📝 غياب مبرَّر</th>
                        <th style={{border:"1px solid #cbd5e1",padding:"10px",color:"#dc2626"}}>❌ غياب غير مبرَّر</th>
                        <th style={{border:"1px solid #cbd5e1",padding:"10px",color:"#16a34a"}}>نسبة الحضور</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, idx) => {
                        const st = stats[s.id] || {late:0, exc:0, unexc:0}
                        const rate = presenceRate(s)
                        return (
                          <tr key={s.id} style={{background: idx % 2 === 0 ? "white" : "#f8fafc"}}>
                            <td style={{border:"1px solid #cbd5e1",padding:"8px",textAlign:"center",color:"#6b7280"}}>{idx+1}</td>
                            <td style={{border:"1px solid #cbd5e1",padding:"8px",fontWeight:"bold",color:"#1e293b"}}>{s.name}</td>
                            <td style={{border:"1px solid #cbd5e1",padding:"8px",textAlign:"center",color: st.late > 0 ? "#ca8a04" : "#9ca3af",fontWeight: st.late > 0 ? "bold" : "normal"}}>{st.late}</td>
                            <td style={{border:"1px solid #cbd5e1",padding:"8px",textAlign:"center",color: st.exc > 0 ? "#2563eb" : "#9ca3af",fontWeight: st.exc > 0 ? "bold" : "normal"}}>{st.exc}</td>
                            <td style={{border:"1px solid #cbd5e1",padding:"8px",textAlign:"center",color: st.unexc > 0 ? "#dc2626" : "#9ca3af",fontWeight: st.unexc > 0 ? "bold" : "normal"}}>{st.unexc}</td>
                            <td style={{border:"1px solid #cbd5e1",padding:"8px",textAlign:"center",fontWeight:"bold",
                              color: rate >= 90 ? "#16a34a" : rate >= 75 ? "#ca8a04" : "#dc2626"}}>
                              {rate}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{background:"#f1f5f9",fontWeight:"bold"}}>
                        <td colSpan={2} style={{border:"1px solid #cbd5e1",padding:"10px",color:"#1e3a8a"}}>المجموع ({students.length} تلميذاً)</td>
                        <td style={{border:"1px solid #cbd5e1",padding:"10px",textAlign:"center",color:"#ca8a04"}}>{classTotals.late}</td>
                        <td style={{border:"1px solid #cbd5e1",padding:"10px",textAlign:"center",color:"#2563eb"}}>{classTotals.exc}</td>
                        <td style={{border:"1px solid #cbd5e1",padding:"10px",textAlign:"center",color:"#dc2626"}}>{classTotals.unexc}</td>
                        <td style={{border:"1px solid #cbd5e1",padding:"10px",textAlign:"center",color:"#16a34a"}}>{classPresence}%</td>
                      </tr>
                    </tfoot>
                  </table>

                  <p style={{color:"#9ca3af",fontSize:"12px",marginTop:"16px",textAlign:"left"}}>
                    حُرِّر بتاريخ: {new Date().toLocaleDateString('ar-MA')} — توقيع الأستاذ(ة): ..........................
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}