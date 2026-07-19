'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const MONTHS = ["يناير","فبراير","مارس","أبريل","ماي","يونيو","يوليوز","غشت","شتنبر","أكتوبر","نونبر","دجنبر"]
// اختصارات أيام الأسبوع بالنموذج الرسمي (الأحد يوم عطلة لا يظهر)
const DAY_LETTERS: {[key:number]:string} = {1:"إ", 2:"ث", 3:"ر", 4:"خ", 5:"ج", 6:"س"}

function currentMonthISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

export default function AttendanceReportPage() {
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [month, setMonth] = useState(currentMonthISO())
  const [students, setStudents] = useState<any[]>([])
  const [totalSessions, setTotalSessions] = useState(0)
  const [dayData, setDayData] = useState<{[studentId:string]:{[day:number]:{m?:string,e?:string}}}>({})
  const [teacherName, setTeacherName] = useState('')
  const [info, setInfo] = useState({academy:'', direction:'', school:'', unit:'', level:'', season:'2026/2027'})

  // تحميل معلومات المؤسسة المحفوظة سابقاً
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arabiyati_school_info')
      if (saved) setInfo(prev => ({ ...prev, ...JSON.parse(saved) }))
    } catch (e) {}
  }, [])

  const updateInfo = (key: string, value: string) => {
    setInfo(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem('arabiyati_school_info', JSON.stringify(next)) } catch (e) {}
      return next
    })
  }

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { window.location.href = '/auth/login'; return }
      const { data: me } = await supabase.from('users').select('name').eq('id', session.user.id).single()
      setTeacherName(me?.name || '')
      const { data: cls } = await supabase.from('classes').select('id, name').eq('teacher_id', session.user.id)
      setClasses(cls || [])
      if (cls && cls.length > 0) setSelectedClass(cls[0].id)
      setLoading(false)
    }
    load()
  }, [])

  const [year, monthNum] = month.split('-').map(Number)
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  // أيام الشهر بدون الأحد (يوم عطلة)
  const schoolDays: {day:number, letter:string}[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const wd = new Date(year, monthNum - 1, d).getDay() // 0=أحد
    if (wd !== 0) schoolDays.push({ day: d, letter: DAY_LETTERS[wd] })
  }

  useEffect(() => {
    if (!selectedClass) return
    const loadReport = async () => {
      const from = `${month}-01`
      const to = `${month}-${String(daysInMonth).padStart(2,'0')}`

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
        .select('student_id, date, session, status')
        .eq('class_id', selectedClass)
        .gte('date', from)
        .lte('date', to)

      const map: {[k:string]:{[day:number]:{m?:string,e?:string}}} = {}
      ;(records || []).forEach((r:any) => {
        const day = Number(r.date.split('-')[2])
        if (!map[r.student_id]) map[r.student_id] = {}
        if (!map[r.student_id][day]) map[r.student_id][day] = {}
        if (r.session === 'morning') map[r.student_id][day].m = r.status
        else map[r.student_id][day].e = r.status
      })
      setDayData(map)
    }
    loadReport()
  }, [selectedClass, month, daysInMonth])

  // حساب أنصاف أيام الغياب لتلميذ
  const absHalfDays = (studentId: string) => {
    let count = 0
    const days = dayData[studentId] || {}
    Object.values(days).forEach((d:any) => {
      if (d.m === 'absent_excused' || d.m === 'absent_unexcused') count++
      if (d.e === 'absent_excused' || d.e === 'absent_unexcused') count++
    })
    return count
  }

  // محتوى خلية اليوم: عدد أنصاف الغياب أو علامة تأخر
  const dayCell = (studentId: string, day: number) => {
    const d = (dayData[studentId] || {})[day]
    if (!d) return { text: '', color: '' }
    let abs = 0, unexc = false, late = false
    ;[d.m, d.e].forEach(s => {
      if (s === 'absent_excused') abs++
      if (s === 'absent_unexcused') { abs++; unexc = true }
      if (s === 'late') late = true
    })
    if (abs > 0) return { text: String(abs), color: unexc ? '#dc2626' : '#2563eb' }
    if (late) return { text: 'ت', color: '#ca8a04' }
    return { text: '', color: '' }
  }

  const className = classes.find(c => c.id === selectedClass)?.name || ''

  // خانة قابلة للكتابة داخل الجدول (تُملأ تلقائياً ويمكن تعديلها قبل الطبع)
  const editableCell = (id: string, defaultValue: any, color?: string, fontSize?: string, bold?: boolean, align?: string) => (
    <input
      key={`${selectedClass}-${month}-${id}-${defaultValue}`}
      defaultValue={defaultValue}
      style={{border:"none",outline:"none",width:"100%",background:"transparent",
        textAlign: (align || "center") as any, fontFamily:"Arial",
        fontSize: fontSize || "11px", fontWeight: bold ? "bold" : "normal",
        color: color || "#1e293b", padding:0, boxSizing:"border-box"}}
    />
  )

  const headerInput = (key: keyof typeof info) => (
    <input
      value={info[key]}
      onChange={e => updateInfo(key, e.target.value)}
      style={{border:"none",outline:"none",width:"100%",fontSize:"12px",fontFamily:"Arial",textAlign:"right",background:"transparent",fontWeight:"bold",color:"#1e293b"}}
    />
  )

  const hCell: any = {border:"1px solid #000",padding:"3px 6px",fontSize:"12px"}
  const hLabel: any = {...hCell, fontWeight:"bold", background:"#f8fafc", whiteSpace:"nowrap", width:"110px"}

  if (loading) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          main { background: white !important; padding: 0 !important; }
          .doc-wrap { max-width: none !important; margin: 0 !important; padding: 0 !important; }
          .print-area { box-shadow: none !important; border-radius: 0 !important; padding: 8mm !important; margin: 0 !important; }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>

      <nav className="no-print" style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",flexWrap:"wrap",gap:"8px"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>📊 سجل الغياب الشهري (النموذج الرسمي)</h1>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <a href="/dashboard/teacher/attendance" style={{background:"#f0fdf4",color:"#16a34a",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>📋 سجل الغياب</a>
          <a href="/dashboard/teacher" style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>العودة للوحة</a>
        </div>
      </nav>

      <div className="doc-wrap" style={{maxWidth:"1180px",margin:"0 auto",padding:"20px"}}>

        {classes.length === 0 ? (
          <div style={{background:"white",borderRadius:"16px",padding:"40px",textAlign:"center"}}>
            <p style={{color:"#6b7280",fontSize:"17px"}}>لم تنشئ أي فصل بعد.</p>
          </div>
        ) : (
          <>
            <div className="no-print" style={{background:"white",borderRadius:"16px",padding:"16px",marginBottom:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",display:"flex",gap:"14px",flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{minWidth:"170px"}}>
                <label style={{display:"block",marginBottom:"6px",fontWeight:"bold",color:"#374151",fontSize:"13px"}}>الفصل</label>
                <select value={selectedClass ?? ''} onChange={e => setSelectedClass(Number(e.target.value))}
                  style={{width:"100%",padding:"9px",borderRadius:"8px",border:"2px solid #e5e7eb",fontSize:"14px",direction:"rtl",background:"white",cursor:"pointer"}}>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{minWidth:"150px"}}>
                <label style={{display:"block",marginBottom:"6px",fontWeight:"bold",color:"#374151",fontSize:"13px"}}>الشهر</label>
                <input type="month" value={month} onChange={e => setMonth(e.target.value)}
                  style={{width:"100%",padding:"8px",borderRadius:"8px",border:"2px solid #e5e7eb",fontSize:"14px",boxSizing:"border-box"}}/>
              </div>
              <button onClick={() => window.print()}
                style={{background:"#2563eb",color:"white",border:"none",padding:"11px 22px",borderRadius:"8px",fontSize:"15px",fontWeight:"bold",cursor:"pointer"}}>
                🖨️ طباعة اللائحة
              </button>
              <p style={{fontSize:"12px",color:"#9ca3af",margin:0,flexBasis:"100%"}}>
                💡 خانات المؤسسة (الأكاديمية، المديرية...) قابلة للكتابة مباشرة في الورقة أدناه وتُحفظ تلقائياً لطباعات المرات القادمة. اختر الاتجاه الأفقي (Paysage) عند الطباعة.
              </p>
            </div>

            <div className="print-area" style={{background:"white",borderRadius:"12px",padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",overflowX:"auto"}}>

              {/* الترويسة الرسمية */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px",marginBottom:"10px"}}>
                <table style={{borderCollapse:"collapse",width:"290px"}}>
                  <tbody>
                    <tr><td style={hLabel}>اسم الأستاذ(ة)</td><td style={hCell}><span style={{fontWeight:"bold",fontSize:"12px"}}>{teacherName}</span></td></tr>
                    <tr><td style={hLabel}>المستوى الدراسي</td><td style={hCell}>{headerInput('level')}</td></tr>
                    <tr><td style={hLabel}>الفوج</td><td style={hCell}><span style={{fontWeight:"bold",fontSize:"12px"}}>{className}</span></td></tr>
                    <tr><td style={hLabel}>الموسم الدراسي</td><td style={hCell}>{headerInput('season')}</td></tr>
                  </tbody>
                </table>

                <div style={{textAlign:"center",flexShrink:0}}>
                  <img src="/images/ministry-logo.png" alt="وزارة التربية الوطنية" style={{height:"85px",objectFit:"contain"}}/>
                </div>

                <table style={{borderCollapse:"collapse",width:"290px"}}>
                  <tbody>
                    <tr><td style={hLabel}>الأكاديمية</td><td style={hCell}>{headerInput('academy')}</td></tr>
                    <tr><td style={hLabel}>المديرية</td><td style={hCell}>{headerInput('direction')}</td></tr>
                    <tr><td style={hLabel}>المؤسسة التعليمية</td><td style={hCell}>{headerInput('school')}</td></tr>
                    <tr><td style={hLabel}>الوحدة المدرسية</td><td style={hCell}>{headerInput('unit')}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* شريط العنوان */}
              <div style={{display:"flex",gap:"10px",alignItems:"stretch",marginBottom:"10px"}}>
                <div style={{border:"1px solid #000",padding:"6px 12px",fontWeight:"bold",fontSize:"13px",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:"6px"}}>
                  <span>عدد أنصاف أيام الدراسة :</span>
                  <span style={{width:"50px",display:"inline-block"}}>
                    {editableCell('header-total', totalSessions, "#1e293b", "13px", true)}
                  </span>
                </div>
                <div style={{flex:1,background:"#fde68a",border:"1px solid #000",textAlign:"center",fontWeight:"bold",fontSize:"16px",padding:"6px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  سجل الغياب الشهري — شهر {MONTHS[monthNum-1]} {year}
                </div>
              </div>

              {/* الجدول الرئيسي */}
              <table style={{borderCollapse:"collapse",width:"100%"}}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{border:"1px solid #000",padding:"2px 4px",fontSize:"11px",background:"#f8fafc",width:"24px"}}>ر.ت</th>
                    <th rowSpan={2} style={{border:"1px solid #000",padding:"2px 8px",fontSize:"12px",background:"#f8fafc",minWidth:"150px"}}>الاسم والنسب للتلميذ(ة)</th>
                    {schoolDays.map(d => (
                      <th key={d.day} style={{border:"1px solid #000",padding:"1px",fontSize:"10px",background:"#f8fafc",width:"20px"}}>{d.letter}</th>
                    ))}
                    <th rowSpan={2} style={{border:"1px solid #000",padding:"2px",fontSize:"10px",background:"#f8fafc",width:"38px"}}>عدد أنصاف أيام الدراسة</th>
                    <th rowSpan={2} style={{border:"1px solid #000",padding:"2px",fontSize:"10px",background:"#f8fafc",width:"38px"}}>عدد أنصاف أيام الغياب</th>
                    <th rowSpan={2} style={{border:"1px solid #000",padding:"2px",fontSize:"10px",background:"#f8fafc",width:"38px"}}>عدد أنصاف أيام الحضور</th>
                    <th rowSpan={2} style={{border:"1px solid #000",padding:"2px 6px",fontSize:"11px",background:"#f8fafc",width:"70px"}}>ملاحظات</th>
                  </tr>
                  <tr>
                    {schoolDays.map(d => (
                      <th key={d.day} style={{border:"1px solid #000",padding:"1px",fontSize:"10px",background:"#e2e8f0"}}>{d.day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => {
                    const abs = absHalfDays(s.id)
                    return (
                      <tr key={s.id}>
                        <td style={{border:"1px solid #000",padding:"2px",fontSize:"11px",textAlign:"center"}}>{idx+1}</td>
                        <td style={{border:"1px solid #000",padding:"2px 8px",whiteSpace:"nowrap"}}>
                          {editableCell(`${s.id}-name`, s.name, "#1e293b", "12px", true, "right")}
                        </td>
                        {schoolDays.map(d => {
                          const cell = dayCell(s.id, d.day)
                          return (
                            <td key={d.day} style={{border:"1px solid #000",padding:"1px",height:"22px"}}>
                              {editableCell(`${s.id}-d${d.day}`, cell.text, cell.color || "#1e293b", "11px", true)}
                            </td>
                          )
                        })}
                        <td style={{border:"1px solid #000",padding:"2px"}}>
                          {editableCell(`${s.id}-total`, totalSessions)}
                        </td>
                        <td style={{border:"1px solid #000",padding:"2px"}}>
                          {editableCell(`${s.id}-abs`, abs, abs > 0 ? "#dc2626" : "#1e293b", "11px", true)}
                        </td>
                        <td style={{border:"1px solid #000",padding:"2px"}}>
                          {editableCell(`${s.id}-pres`, Math.max(0, totalSessions - abs), "#16a34a", "11px", true)}
                        </td>
                        <td style={{border:"1px solid #000",padding:"2px"}}>
                          {editableCell(`${s.id}-note`, "", "#1e293b", "11px", false, "right")}
                        </td>
                      </tr>
                    )
                  })}
                  {/* أسطر فارغة إضافية كالنموذج الورقي */}
                  {Array.from({length: Math.max(0, 5 - students.length % 5 === 0 ? 0 : 0)}).map((_, i) => null)}
                </tbody>
              </table>

              {/* مفتاح الرموز */}
              <div style={{display:"flex",gap:"18px",marginTop:"8px",fontSize:"11px",color:"#374151",flexWrap:"wrap"}}>
                <span><b style={{color:"#dc2626"}}>1/2</b> بالأحمر: أنصاف أيام غياب (غير مبرَّر)</span>
                <span><b style={{color:"#2563eb"}}>1/2</b> بالأزرق: أنصاف أيام غياب مبرَّر</span>
                <span><b style={{color:"#ca8a04"}}>ت</b>: تأخر</span>
                <span style={{marginRight:"auto"}}>توقيع الأستاذ(ة): ..........................</span>
              </div>

            </div>
          </>
        )}
      </div>
    </main>
  )
}