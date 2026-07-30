'use client'
// ============================================================
//  لوحة الأستاذ الرئيسية — بتدفّق تفاعلي
//  المكان: src/app/dashboard/teacher/page.tsx
//
//  التدفّق: أيقونة ← اختيار المستوى ← اختيار الفصل (إن تعدّد) ← التفاصيل
//  يغطّي كل السيناريوهات: مستوى بلا فصل / بفصل واحد / بفصول متعددة،
//  وفصل بلا تلاميذ، وأستاذ بلا أي فصل بعد.
// ============================================================
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getUpcomingEvents, daysUntil, fmtRange } from '@/lib/calendarEvents'
import { BRAND, GRADIENTS } from '@/lib/brand'
import TeacherNav from '@/components/TeacherNav'
import { computeAllUnitsProgress } from '@/lib/completionStats'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

type StudentRow = { id: string; name: string; points: number; lessons: number; textsCompleted: number; textsTotal: number }
type ClassSummary = {
  id: number
  name: string
  join_code: string | null
  gradeLevel: string | null   // مستنتَج من تلاميذه؛ null إن لم ينضمّ أحد بعد
  students: StudentRow[]
  totalPoints: number
  totalLessons: number
}

type Screen = 'start' | 'levels' | 'classPick' | 'detail'

const gradeNames: {[key:string]:string} = {
  "1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"
}
const gradeColors: {[key:string]:string} = {
  "1":"#2563eb","2":"#16a34a","3":"#9333ea","4":"#ea580c","5":"#0891b2","6":"#be185d"
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true)
  const [teacherName, setTeacherName] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([])
  const [showNewClass, setShowNewClass] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [creating, setCreating] = useState(false)

  const [screen, setScreen] = useState<Screen>('start')
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)

  // ---------- الحضور الحيّ ----------
  const [presence, setPresence] = useState<{status:string; message:string; link_path:string; updated_at:string} | null>(null)
  const [presenceMsg, setPresenceMsg] = useState('')
  const [presenceLink, setPresenceLink] = useState('')
  const [presenceLoading, setPresenceLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { window.location.href = '/auth/login'; return }
    const { data: roleCheck } = await supabase.from('users').select('role').eq('id', session.user.id).single()
    if (roleCheck?.role !== 'teacher') { window.location.href = '/dashboard/student'; return }
    setTeacherId(session.user.id)

    const { data: teacherData } = await supabase
      .from('users').select('name').eq('id', session.user.id).single()
    if (teacherData) setTeacherName(teacherData.name)

    const { data: classes } = await supabase
      .from('classes').select('*').eq('teacher_id', session.user.id).order('created_at', { ascending: false })

    const classList = classes || []
    if (classList.length === 0) {
      setClassSummaries([])
      setLoading(false)
      return
    }

    const classIds = classList.map(c => c.id)
    const { data: allStudents } = await supabase
      .from('users').select('id, name, grade_level, class_id').in('class_id', classIds)

    const students = allStudents || []
    const userIds = students.map(s => s.id)
    const { data: allPoints } = userIds.length > 0
      ? await supabase.from('points').select('user_id, points, text_id, lesson_year, lesson_unit').in('user_id', userIds)
      : { data: [] }

    const pointsPerStudent: {[id: string]: number} = {}
    const lessonsPerStudent: {[id: string]: number} = {}
    ;(allPoints || []).forEach((p: any) => {
      pointsPerStudent[p.user_id] = (pointsPerStudent[p.user_id] || 0) + p.points
      lessonsPerStudent[p.user_id] = (lessonsPerStudent[p.user_id] || 0) + 1
    })

    const summaries: ClassSummary[] = classList.map((cls: any) => {
      const clsStudents = students
        .filter(s => s.class_id === cls.id)
        .map(s => {
          const studentPoints = (allPoints || []).filter((p: any) => p.user_id === s.id)
          const progress = computeAllUnitsProgress(studentPoints)
          const textsCompleted = progress.reduce((sum, u) => sum + u.completedTexts, 0)
          const textsTotal = progress.reduce((sum, u) => sum + u.totalTexts, 0)
          return {
            id: s.id,
            name: s.name,
            points: pointsPerStudent[s.id] || 0,
            lessons: lessonsPerStudent[s.id] || 0,
            textsCompleted,
            textsTotal,
          }
        })
        .sort((a, b) => b.points - a.points)

      // مستوى الفصل يُستنتج من أول تلميذ منضمّ له مستوى معروف
      const gradeLevel = clsStudents.length > 0
        ? (students.find(s => s.class_id === cls.id)?.grade_level || null)
        : null

      return {
        id: cls.id,
        name: cls.name,
        join_code: cls.join_code,
        gradeLevel,
        students: clsStudents,
        totalPoints: clsStudents.reduce((sum, s) => sum + s.points, 0),
        totalLessons: clsStudents.reduce((sum, s) => sum + s.lessons, 0),
      }
    })

    setClassSummaries(summaries)
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

  // ---------- منطق التدفّق ----------
  const myGrades = new Set(
    classSummaries.filter(c => c.gradeLevel).map(c => c.gradeLevel as string)
  )
  const emptyClasses = classSummaries.filter(c => c.students.length === 0)

  const classesForGrade = (grade: string) =>
    classSummaries.filter(c => c.gradeLevel === grade)

  const chooseGrade = (grade: string) => {
    setSelectedGrade(grade)
    const matches = classesForGrade(grade)
    if (matches.length === 0) {
      setScreen('detail') // ستُعرض رسالة "ليس مستواك"
      setSelectedClassId(null)
    } else if (matches.length === 1) {
      setSelectedClassId(matches[0].id)
      setScreen('detail')
    } else {
      setScreen('classPick')
    }
  }

  const chooseClass = (classId: number) => {
    setSelectedClassId(classId)
    setScreen('detail')
  }

  const backToLevels = () => {
    setSelectedGrade('')
    setSelectedClassId(null)
    setScreen('levels')
  }

  const openClassDirectly = (classId: number, grade: string | null) => {
    setSelectedClassId(classId)
    setSelectedGrade(grade || '')
    setScreen('detail')
  }

  // تحميل حالة الحضور عند فتح تفاصيل فصل
  useEffect(() => {
    if (screen !== 'detail' || !selectedClassId) { setPresence(null); return }
    const loadPresence = async () => {
      const { data } = await supabase
        .from('class_presence')
        .select('status, message, link_path, updated_at')
        .eq('class_id', selectedClassId)
        .maybeSingle()
      setPresence(data || null)
      setPresenceMsg(data?.message || '')
      setPresenceLink(data?.link_path || '')
    }
    loadPresence()
  }, [screen, selectedClassId])

  const PRESENCE_VALID_MINUTES = 30
  const isPresenceLive = (p: typeof presence) => {
    if (!p || p.status !== 'online') return false
    const ageMinutes = (Date.now() - new Date(p.updated_at).getTime()) / 60000
    return ageMinutes < PRESENCE_VALID_MINUTES
  }

  const broadcastPresence = async () => {
    if (!selectedClassId || !teacherId) return
    setPresenceLoading(true)
    const { data } = await supabase
      .from('class_presence')
      .upsert({
        class_id: selectedClassId,
        teacher_id: teacherId,
        status: 'online',
        message: presenceMsg.trim() || null,
        link_path: presenceLink.trim() || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'class_id' })
      .select('status, message, link_path, updated_at')
      .single()
    setPresence(data || null)
    setPresenceLoading(false)
  }

  const stopPresence = async () => {
    if (!selectedClassId || !teacherId) return
    setPresenceLoading(true)
    const { data } = await supabase
      .from('class_presence')
      .upsert({
        class_id: selectedClassId,
        teacher_id: teacherId,
        status: 'offline',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'class_id' })
      .select('status, message, link_path, updated_at')
      .single()
    setPresence(data || null)
    setPresenceLoading(false)
  }

  if (loading) return (
    <>
      <TeacherNav active="home" />
      <div dir="rtl" style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
        <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
      </div>
    </>
  )

  const selectedClass = classSummaries.find(c => c.id === selectedClassId) || null
  const isKnownGrade = selectedGrade && myGrades.has(selectedGrade)

  return (
    <>
      <TeacherNav active="home" />
      <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",padding:"24px"}}>

          {/* ترحيب ثابت */}
          <div style={{background:"linear-gradient(135deg,#2563eb,#1e3a8a)",borderRadius:"16px",padding:"24px",marginBottom:"24px",color:"white"}}>
            <h2 style={{fontSize:"24px",fontWeight:"bold",margin:0}}>مرحباً أستاذ {teacherName} 👋</h2>
            <p style={{opacity:0.85,marginTop:"8px"}}>هذه نظرة عامة حقيقية على تقدم تلاميذك</p>
          </div>

          {/* المحطة القادمة */}
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

          {/* لا فصول بعد إطلاقاً */}
          {classSummaries.length === 0 && (
            <div style={{background:"white",borderRadius:"16px",padding:"20px",marginBottom:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                <h3 style={{color:"#1e3a8a",fontSize:"18px",fontWeight:"bold",margin:0}}>📚 فصولي</h3>
                <button onClick={()=>setShowNewClass(!showNewClass)}
                  style={{background:"#2563eb",color:"white",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"14px"}}>
                  + فصل جديد
                </button>
              </div>
              {showNewClass && (
                <div style={{display:"flex",gap:"8px"}}>
                  <input value={newClassName} onChange={e=>setNewClassName(e.target.value)}
                    placeholder="اسم الفصل (مثلاً: السنة الرابعة أ)"
                    style={{flex:1,padding:"10px",borderRadius:"8px",border:"2px solid #e5e7eb",fontSize:"14px",direction:"rtl"}}/>
                  <button onClick={handleCreateClass} disabled={creating || !newClassName.trim()}
                    style={{background:"#16a34a",color:"white",border:"none",padding:"10px 20px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"14px",opacity: newClassName.trim() ? 1 : 0.5}}>
                    {creating ? "..." : "إنشاء"}
                  </button>
                </div>
              )}
              {!showNewClass && (
                <p style={{color:"#9ca3af",fontSize:"14px",textAlign:"center",padding:"16px 0"}}>
                  لم تنشئ أي فصل بعد. اضغط "+ فصل جديد" للبدء.
                </p>
              )}
            </div>
          )}

          {classSummaries.length > 0 && (
            <>
              {/* ---------- الشاشة 1: أيقونة الانطلاق ---------- */}
              {screen === 'start' && (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 0",gap:"20px"}}>
                  <button
                    onClick={() => setScreen('levels')}
                    style={{
                      width:"140px", height:"140px", borderRadius:"50%",
                      background:"linear-gradient(135deg,#2563eb,#1e3a8a)",
                      border:"none", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow:"0 8px 24px rgba(37,99,235,0.35)",
                      transition:"transform 0.15s",
                    }}
                    onMouseOver={e => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <span style={{fontSize:"46px"}}>📚</span>
                  </button>
                  <div style={{textAlign:"center"}}>
                    <p style={{fontSize:"19px",fontWeight:"bold",color:"#1e293b",margin:0}}>فصولي</p>
                    <p style={{fontSize:"14px",color:"#6b7280",marginTop:"6px"}}>اضغط لاختيار المستوى وعرض فصلك وتلاميذه</p>
                  </div>
                </div>
              )}

              {/* ---------- الشاشة 2: اختيار المستوى ---------- */}
              {screen === 'levels' && (
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
                    <button onClick={() => setScreen('start')}
                      style={{background:"#f3f4f6",color:"#6b7280",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                      → رجوع
                    </button>
                    <h3 style={{color:"#1e293b",fontSize:"19px",fontWeight:"bold",margin:0}}>اختر المستوى</h3>
                    <button onClick={()=>setShowNewClass(!showNewClass)}
                      style={{background:"#eff6ff",color:"#2563eb",border:"none",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"13px"}}>
                      + فصل جديد
                    </button>
                  </div>

                  {showNewClass && (
                    <div style={{display:"flex",gap:"8px",marginBottom:"20px",background:"white",padding:"14px",borderRadius:"12px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                      <input value={newClassName} onChange={e=>setNewClassName(e.target.value)}
                        placeholder="اسم الفصل (مثلاً: السنة الرابعة أ)"
                        style={{flex:1,padding:"10px",borderRadius:"8px",border:"2px solid #e5e7eb",fontSize:"14px",direction:"rtl"}}/>
                      <button onClick={handleCreateClass} disabled={creating || !newClassName.trim()}
                        style={{background:"#16a34a",color:"white",border:"none",padding:"10px 20px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"14px",opacity: newClassName.trim() ? 1 : 0.5}}>
                        {creating ? "..." : "إنشاء"}
                      </button>
                    </div>
                  )}

                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"14px"}}>
                    {["1","2","3","4","5","6"].map(grade => {
                      const color = gradeColors[grade]
                      const mine = myGrades.has(grade)
                      const count = classesForGrade(grade).length
                      return (
                        <button
                          key={grade}
                          onClick={() => chooseGrade(grade)}
                          style={{
                            background:"white", border:`2px solid ${mine ? color : "#e5e7eb"}`,
                            borderRadius:"14px", padding:"22px 12px", cursor:"pointer",
                            display:"flex", flexDirection:"column", alignItems:"center", gap:"8px",
                            boxShadow: mine ? `0 4px 14px ${color}33` : "0 2px 8px rgba(0,0,0,0.05)",
                            position:"relative",
                          }}
                        >
                          {mine && (
                            <span style={{position:"absolute", top:"8px", left:"8px", background:color, color:"white", borderRadius:"20px", fontSize:"10px", padding:"2px 8px", fontWeight:"bold"}}>
                              {count > 1 ? `${count} فصول` : "فصلك"}
                            </span>
                          )}
                          <span style={{fontSize:"28px"}}>🏫</span>
                          <span style={{fontWeight:"bold", color:"#1e293b", fontSize:"15px"}}>
                            السنة {gradeNames[grade]}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* فصول بانتظار أول تلميذ (مستواها غير معروف بعد) */}
                  {emptyClasses.length > 0 && (
                    <div style={{marginTop:"24px",background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:"12px",padding:"16px"}}>
                      <p style={{color:"#92400e",fontWeight:"bold",fontSize:"14px",margin:"0 0 10px"}}>
                        💡 فصول أنشأتَها حديثاً بانتظار انضمام أول تلميذ (لم يُعرف مستواها بعد):
                      </p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
                        {emptyClasses.map(c => (
                          <button key={c.id} onClick={() => openClassDirectly(c.id, null)}
                            style={{background:"white",border:"1px solid #fcd34d",borderRadius:"8px",padding:"8px 14px",cursor:"pointer",fontSize:"13px",fontWeight:"bold",color:"#92400e"}}>
                            {c.name} — رمز: {c.join_code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------- الشاشة 3: اختيار الفصل (عند تعدّد فصول المستوى) ---------- */}
              {screen === 'classPick' && (
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
                    <button onClick={backToLevels}
                      style={{background:"#f3f4f6",color:"#6b7280",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                      → مستوى آخر
                    </button>
                    <h3 style={{color:"#1e293b",fontSize:"18px",fontWeight:"bold",margin:0}}>
                      اختر الفصل — السنة {gradeNames[selectedGrade]}
                    </h3>
                    <span style={{width:"90px"}}></span>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"14px"}}>
                    {classesForGrade(selectedGrade).map(c => (
                      <button key={c.id} onClick={() => chooseClass(c.id)}
                        style={{background:"white",border:`2px solid ${gradeColors[selectedGrade]}`,borderRadius:"14px",padding:"18px",cursor:"pointer",textAlign:"right"}}>
                        <p style={{fontWeight:"bold",color:"#1e293b",fontSize:"16px",margin:"0 0 8px"}}>{c.name}</p>
                        <p style={{color:"#6b7280",fontSize:"13px",margin:0}}>{c.students.length} تلميذ</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------- الشاشة 4: التفاصيل ---------- */}
              {screen === 'detail' && (
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
                    <button onClick={backToLevels}
                      style={{background:"#f3f4f6",color:"#6b7280",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                      → مستوى آخر
                    </button>
                    {selectedGrade && (
                      <span style={{color:"#6b7280",fontSize:"13px"}}>السنة {gradeNames[selectedGrade] || ''}</span>
                    )}
                  </div>

                  {!selectedClass ? (
                    // ----- ليس مستوى الأستاذ -----
                    <div style={{background:"white",borderRadius:"16px",padding:"40px 24px",textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
                      <div style={{fontSize:"52px",marginBottom:"12px"}}>🚫</div>
                      <p style={{fontSize:"18px",fontWeight:"bold",color:"#dc2626",margin:0}}>
                        السنة {gradeNames[selectedGrade]} ليست مستواك
                      </p>
                      <p style={{color:"#6b7280",fontSize:"14px",marginTop:"10px"}}>
                        لا تدرّس هذا المستوى حالياً، أو لم ينضمّ إليه أي تلميذ من فصولك بعد.
                      </p>
                      <button onClick={backToLevels}
                        style={{marginTop:"20px",background:"#2563eb",color:"white",border:"none",padding:"10px 24px",borderRadius:"10px",fontWeight:"bold",cursor:"pointer"}}>
                        اختيار مستوى آخر
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* بطاقة الفصل + رمز الانضمام */}
                      <div style={{background:"white",borderRadius:"16px",padding:"18px 20px",marginBottom:"18px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
                        <p style={{fontWeight:"bold",color:"#1e293b",fontSize:"18px",margin:0}}>🏫 {selectedClass.name}</p>
                        {selectedClass.join_code && (
                          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                            <span style={{fontSize:"13px",color:"#6b7280"}}>رمز الانضمام:</span>
                            <span style={{background:"#2563eb",color:"white",padding:"4px 12px",borderRadius:"6px",fontWeight:"bold",fontSize:"15px",letterSpacing:"2px"}}>
                              {selectedClass.join_code}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* الحضور الحيّ */}
                      <div style={{
                        background: isPresenceLive(presence) ? "#f0fdf4" : "white",
                        border: isPresenceLive(presence) ? "2px solid #16a34a" : "1px solid #e5e7eb",
                        borderRadius:"16px", padding:"18px 20px", marginBottom:"18px",
                        boxShadow:"0 2px 10px rgba(0,0,0,0.06)"
                      }}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px",marginBottom: isPresenceLive(presence) ? "12px" : "0"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                            <span style={{fontSize:"20px"}}>{isPresenceLive(presence) ? "🟢" : "⚪"}</span>
                            <span style={{fontWeight:"bold",color:"#1e293b",fontSize:"15px"}}>
                              {isPresenceLive(presence) ? "أنت الآن حاضر — يراك تلاميذك" : "الحضور الحيّ"}
                            </span>
                          </div>
                          {isPresenceLive(presence) ? (
                            <button onClick={stopPresence} disabled={presenceLoading}
                              style={{background:"#fee2e2",color:"#dc2626",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"13px"}}>
                              {presenceLoading ? "..." : "إنهاء الحضور"}
                            </button>
                          ) : (
                            <button onClick={broadcastPresence} disabled={presenceLoading}
                              style={{background:"#16a34a",color:"white",border:"none",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"13px"}}>
                              {presenceLoading ? "..." : "🟢 أنا حاضر الآن"}
                            </button>
                          )}
                        </div>

                        {!isPresenceLive(presence) && (
                          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginTop:"12px"}}>
                            <input value={presenceMsg} onChange={e=>setPresenceMsg(e.target.value)}
                              placeholder="رسالة اختيارية للتلاميذ (مثلاً: توجّهوا لدرس القراءة الآن)"
                              style={{flex:"2",minWidth:"200px",padding:"9px 12px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"13px",direction:"rtl"}}/>
                          </div>
                        )}

                        {isPresenceLive(presence) && presence?.message && (
                          <p style={{color:"#166534",fontSize:"14px",margin:0,background:"white",borderRadius:"8px",padding:"8px 12px"}}>
                            💬 {presence.message}
                          </p>
                        )}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px",marginBottom:"20px"}}>
                        <div style={{background:"white",borderRadius:"14px",padding:"18px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}>
                          <div style={{fontSize:"30px",marginBottom:"6px"}}>👨‍🎓</div>
                          <div style={{fontSize:"24px",fontWeight:"bold",color:"#2563eb"}}>{selectedClass.students.length}</div>
                          <div style={{color:"#6b7280",fontSize:"13px"}}>عدد التلاميذ</div>
                        </div>
                        <div style={{background:"white",borderRadius:"14px",padding:"18px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}>
                          <div style={{fontSize:"30px",marginBottom:"6px"}}>📚</div>
                          <div style={{fontSize:"24px",fontWeight:"bold",color:"#16a34a"}}>{selectedClass.totalLessons}</div>
                          <div style={{color:"#6b7280",fontSize:"13px"}}>دروس مكتملة</div>
                        </div>
                        <div style={{background:"white",borderRadius:"14px",padding:"18px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}>
                          <div style={{fontSize:"30px",marginBottom:"6px"}}>⭐</div>
                          <div style={{fontSize:"24px",fontWeight:"bold",color:"#ca8a04"}}>{selectedClass.totalPoints}</div>
                          <div style={{color:"#6b7280",fontSize:"13px"}}>مجموع النقاط</div>
                        </div>
                      </div>

                      {/* لائحة تلاميذ الفصل */}
                      <div style={{background:"white",borderRadius:"16px",overflow:"hidden",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}>
                        <div style={{background: selectedGrade ? gradeColors[selectedGrade] : "#2563eb", color:"white",padding:"12px 16px",fontWeight:"bold",fontSize:"15px"}}>
                          تلاميذ الفصل
                        </div>
                        <div style={{padding:"12px"}}>
                          {selectedClass.students.length === 0 ? (
                            <p style={{textAlign:"center",color:"#9ca3af",fontSize:"13px",padding:"24px 0"}}>
                              لا يوجد تلاميذ في هذا الفصل بعد. شارك رمز الانضمام أعلاه معهم.
                            </p>
                          ) : (
                            selectedClass.students.map((s, i) => (
                              <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 6px",borderBottom: i<selectedClass.students.length-1 ? "1px solid #f3f4f6" : "none"}}>
                                <span style={{fontSize:"14px",color:"#1e293b"}}>{s.name}</span>
                                <div style={{display:"flex",gap:"10px",fontSize:"12px",alignItems:"center"}}>
                                  {s.textsTotal > 0 && (
                                    <span style={{background:"#f5efe3",color:"#B08D51",padding:"2px 8px",borderRadius:"10px",fontWeight:"bold"}}>
                                      📖 {s.textsCompleted}/{s.textsTotal}
                                    </span>
                                  )}
                                  <span style={{color:"#6b7280"}}>{s.lessons} درس</span>
                                  <span style={{color:"#ca8a04",fontWeight:"bold"}}>⭐{s.points}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}