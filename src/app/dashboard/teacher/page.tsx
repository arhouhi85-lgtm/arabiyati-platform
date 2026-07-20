'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getUpcomingEvents, daysUntil, fmtRange } from '@/lib/calendarEvents'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true)
  const [teacherName, setTeacherName] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [myClasses, setMyClasses] = useState<any[]>([])
  const [studentsByGrade, setStudentsByGrade] = useState<{[grade: string]: any[]}>({})
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalLessons, setTotalLessons] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [showNewClass, setShowNewClass] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { window.location.href = '/auth/login'; return }
    // حارس الدور: هذه اللوحة للأساتذة فقط
    const { data: roleCheck } = await supabase.from('users').select('role').eq('id', session.user.id).single()
    if (roleCheck?.role !== 'teacher') { window.location.href = '/dashboard/student'; return }
    if (!session?.user) { setLoading(false); return }
    setTeacherId(session.user.id)

    const { data: teacherData } = await supabase
      .from('users').select('name').eq('id', session.user.id).single()
    if (teacherData) setTeacherName(teacherData.name)

    const { data: classes } = await supabase
      .from('classes').select('*').eq('teacher_id', session.user.id).order('created_at', { ascending: false })
    setMyClasses(classes || [])

    const classIds = (classes || []).map(c => c.id)

    const { data: allStudents } = classIds.length > 0
      ? await supabase.from('users').select('id, name, grade_level, class_id').in('class_id', classIds)
      : { data: [] }

    const students = allStudents || []
    setTotalStudents(students.length)

    const userIds = students.map(s => s.id)
    const { data: allPoints } = userIds.length > 0
      ? await supabase.from('points').select('user_id, points').in('user_id', userIds)
      : { data: [] }

    setTotalLessons((allPoints || []).length)
    setTotalPoints((allPoints || []).reduce((sum: number, p: any) => sum + p.points, 0))

    const pointsPerStudent: {[id: string]: number} = {}
    const lessonsPerStudent: {[id: string]: number} = {}
    ;(allPoints || []).forEach((p: any) => {
      pointsPerStudent[p.user_id] = (pointsPerStudent[p.user_id] || 0) + p.points
      lessonsPerStudent[p.user_id] = (lessonsPerStudent[p.user_id] || 0) + 1
    })

    const byGrade: {[grade: string]: any[]} = {}
    for (let g = 1; g <= 6; g++) {
      const gradeStr = String(g)
      byGrade[gradeStr] = students
        .filter(s => s.grade_level === gradeStr)
        .map(s => ({
          id: s.id, name: s.name,
          points: pointsPerStudent[s.id] || 0,
          lessons: lessonsPerStudent[s.id] || 0
        }))
        .sort((a, b) => b.points - a.points)
    }
    setStudentsByGrade(byGrade)
    setLoading(false)
  }

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return
    setCreating(true)
    const code = generateCode()
    await supabase.from('classes').insert({
      teacher_id: teacherId,
      name: newClassName,
      join_code: code
    })
    setNewClassName('')
    setShowNewClass(false)
    setCreating(false)
    loadData()
  }

  const gradeNames: {[key:string]:string} = {
    "1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"
  }
  const gradeColors: {[key:string]:string} = {
    "1":"#2563eb","2":"#16a34a","3":"#9333ea","4":"#ea580c","5":"#0891b2","6":"#be185d"
  }

  if (loading) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>عربيتي — لوحة الأستاذ</h1>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <a href="/dashboard/teacher/agenda" style={{background:"#ecfeff",color:"#0891b2",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            📅 المفكرة
          </a>
          <a href="/dashboard/teacher/community" style={{background:"#eff6ff",color:"#2563eb",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            🌐 مجتمع المعرفة
          </a>
          <a href="/dashboard/teacher/chat" style={{background:"#fefce8",color:"#ca8a04",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            💬 رسائل التلاميذ
          </a>
          <a href="/dashboard/teacher/documents" style={{background:"#f5f3ff",color:"#7c3aed",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            📚 الوثائق التربوية
          </a>
          <a href="/dashboard/teacher/attendance" style={{background:"#f0fdf4",color:"#16a34a",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            📋 سجل الغياب
          </a>
          <a href="/dashboard/teacher/leaderboard" style={{background:"#fef9c3",color:"#ca8a04",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            🏆 لوحة الصدارة
          </a>
          <a href="/" style={{background:"#fee2e2",color:"#ef4444",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            خروج
          </a>
        </div>
      </nav>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"24px"}}>

        <div style={{background:"linear-gradient(135deg,#2563eb,#1e3a8a)",borderRadius:"16px",padding:"24px",marginBottom:"24px",color:"white"}}>
          <h2 style={{fontSize:"24px",fontWeight:"bold",margin:0}}>مرحباً أستاذ {teacherName} 👋</h2>
          <p style={{opacity:0.85,marginTop:"8px"}}>هذه نظرة عامة حقيقية على تقدم تلاميذك</p>
        </div>

        {(() => {
          const upcoming = getUpcomingEvents(new Date(), 1)
          if (upcoming.length === 0) return null
          const ev = upcoming[0]
          const dleft = daysUntil(ev.date)
          return (
            <a href="/dashboard/teacher/agenda" style={{textDecoration:"none"}}>
              <div style={{background:"white",borderRadius:"14px",padding:"16px 20px",marginBottom:"24px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",
                display:"flex",alignItems:"center",gap:"14px",border:"1px solid #cffafe",cursor:"pointer"}}>
                <span style={{fontSize:"30px"}}>{ev.icon}</span>
                <div style={{flex:1}}>
                  <p style={{margin:0,fontSize:"12px",color:"#0891b2",fontWeight:"bold"}}>📅 المحطة القادمة</p>
                  <p style={{margin:"2px 0 0 0",fontSize:"15px",fontWeight:"bold",color:"#1e293b"}}>{ev.title}</p>
                  <p style={{margin:"2px 0 0 0",fontSize:"12.5px",color:"#9ca3af"}}>{fmtRange(ev)}</p>
                </div>
                <span style={{background:"#ecfeff",color:"#0891b2",padding:"6px 14px",borderRadius:"20px",fontWeight:"bold",fontSize:"13px",whiteSpace:"nowrap"}}>
                  {dleft === 0 ? "اليوم" : dleft === 1 ? "غداً" : `بعد ${dleft} يوم`}
                </span>
              </div>
            </a>
          )
        })()}

        {/* قسم الفصول */}
        <div style={{background:"white",borderRadius:"16px",padding:"20px",marginBottom:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
            <h3 style={{color:"#1e3a8a",fontSize:"18px",fontWeight:"bold",margin:0}}>📚 فصولي</h3>
            <button onClick={()=>setShowNewClass(!showNewClass)}
              style={{background:"#2563eb",color:"white",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"14px"}}>
              + فصل جديد
            </button>
          </div>

          {showNewClass && (
            <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
              <input value={newClassName} onChange={e=>setNewClassName(e.target.value)}
                placeholder="اسم الفصل (مثلاً: السنة الرابعة أ)"
                style={{flex:1,padding:"10px",borderRadius:"8px",border:"2px solid #e5e7eb",fontSize:"14px",direction:"rtl"}}/>
              <button onClick={handleCreateClass} disabled={creating || !newClassName.trim()}
                style={{background:"#16a34a",color:"white",border:"none",padding:"10px 20px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"14px",opacity: newClassName.trim() ? 1 : 0.5}}>
                {creating ? "..." : "إنشاء"}
              </button>
            </div>
          )}

          {myClasses.length === 0 ? (
            <p style={{color:"#9ca3af",fontSize:"14px",textAlign:"center",padding:"16px 0"}}>
              لم تنشئ أي فصل بعد. اضغط "+ فصل جديد" للبدء.
            </p>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"12px"}}>
              {myClasses.map(cls => (
                <div key={cls.id} style={{background:"#f0f9ff",borderRadius:"10px",padding:"14px",border:"1px solid #bfdbfe"}}>
                  <p style={{fontWeight:"bold",color:"#1e293b",marginBottom:"8px"}}>{cls.name}</p>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontSize:"13px",color:"#6b7280"}}>رمز الانضمام:</span>
                    <span style={{background:"#2563eb",color:"white",padding:"3px 10px",borderRadius:"6px",fontWeight:"bold",fontSize:"15px",letterSpacing:"2px"}}>
                      {cls.join_code}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginBottom:"24px"}}>
          <div style={{background:"white",borderRadius:"16px",padding:"20px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <div style={{fontSize:"36px",marginBottom:"8px"}}>👨‍🎓</div>
            <div style={{fontSize:"28px",fontWeight:"bold",color:"#2563eb"}}>{totalStudents}</div>
            <div style={{color:"#6b7280"}}>عدد التلاميذ</div>
          </div>
          <div style={{background:"white",borderRadius:"16px",padding:"20px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <div style={{fontSize:"36px",marginBottom:"8px"}}>📚</div>
            <div style={{fontSize:"28px",fontWeight:"bold",color:"#16a34a"}}>{totalLessons}</div>
            <div style={{color:"#6b7280"}}>دروس مكتملة</div>
          </div>
          <div style={{background:"white",borderRadius:"16px",padding:"20px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <div style={{fontSize:"36px",marginBottom:"8px"}}>⭐</div>
            <div style={{fontSize:"28px",fontWeight:"bold",color:"#ca8a04"}}>{totalPoints}</div>
            <div style={{color:"#6b7280"}}>مجموع النقاط</div>
          </div>
        </div>

        <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>تلاميذي حسب المستوى</h3>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:"20px"}}>
          {["1","2","3","4","5","6"].map(grade => {
            const students = studentsByGrade[grade] || []
            const color = gradeColors[grade]
            return (
              <div key={grade} style={{background:"white",borderRadius:"16px",overflow:"hidden",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
                <div style={{background:color,color:"white",padding:"12px 16px",fontWeight:"bold",fontSize:"15px",display:"flex",justifyContent:"space-between"}}>
                  <span>السنة {gradeNames[grade]}</span>
                  <span style={{opacity:0.9,fontSize:"13px"}}>{students.length} تلميذ</span>
                </div>
                <div style={{padding:"12px"}}>
                  {students.length === 0 ? (
                    <p style={{textAlign:"center",color:"#9ca3af",fontSize:"13px",padding:"16px 0"}}>لا يوجد تلاميذ بعد</p>
                  ) : (
                    students.map((s, i) => (
                      <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 4px",borderBottom: i<students.length-1 ? "1px solid #f3f4f6" : "none"}}>
                        <span style={{fontSize:"14px",color:"#1e293b"}}>{s.name}</span>
                        <div style={{display:"flex",gap:"8px",fontSize:"12px"}}>
                          <span style={{color:"#6b7280"}}>{s.lessons} درس</span>
                          <span style={{color:"#ca8a04",fontWeight:"bold"}}>⭐{s.points}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}