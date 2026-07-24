'use client'
// ============================================================
//  لوحة الصدارة — الأستاذ
//  المكان: src/app/dashboard/teacher/leaderboard/page.tsx
//
//  تدفّق الصفحة:
//  1) أيقونة واحدة في الوسط
//  2) الضغط عليها يعرض المستويات الستة
//  3) اختيار مستوى:
//     - مستوى الأستاذ  → تظهر لوحة صدارة فصله
//     - مستوى غيره     → رسالة "هذا ليس مستواك"
// ============================================================
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import TeacherNav from '@/components/TeacherNav'

type Screen = 'start' | 'levels' | 'result'

export default function TeacherLeaderboardPage() {
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<Screen>('start')
  const [selectedGrade, setSelectedGrade] = useState<string>('')

  const [allRankings, setAllRankings] = useState<{[grade: string]: any[]}>({})
  const [myGrades, setMyGrades] = useState<Set<string>>(new Set())
  const [hasAnyStudent, setHasAnyStudent] = useState(false)
  const [weekLabel, setWeekLabel] = useState('')

  useEffect(() => {
    loadAllLeaderboards()
  }, [])

  const getWeekStart = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  }

  const loadAllLeaderboards = async () => {
    const weekStart = getWeekStart()
    const monthNames = ['يناير','فبراير','مارس','أبريل','ماي','يونيو','يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر']
    setWeekLabel(`أسبوع ${weekStart.getDate()} ${monthNames[weekStart.getMonth()]}`)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { window.location.href = '/auth/login'; return }

    // جلب فصول هذا الأستاذ فقط
    const { data: myClasses } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', session.user.id)

    const classIds = (myClasses || []).map(c => c.id)
    if (classIds.length === 0) { setLoading(false); return }

    // الترتيب محصور في تلاميذ فصول الأستاذ فقط
    const { data: allStudents } = await supabase
      .from('users')
      .select('id, name, grade_level')
      .eq('role', 'student')
      .in('class_id', classIds)
      .not('grade_level', 'is', null)

    if (!allStudents || allStudents.length === 0) {
      setLoading(false)
      return
    }
    setHasAnyStudent(true)

    const userIds = allStudents.map(u => u.id)
    const { data: weekPoints } = await supabase
      .from('points')
      .select('user_id, points')
      .in('user_id', userIds)
      .gte('created_at', weekStart.toISOString())

    const totals: {[key:string]: number} = {}
    userIds.forEach(id => { totals[id] = 0 })
    ;(weekPoints || []).forEach((p: any) => {
      totals[p.user_id] = (totals[p.user_id] || 0) + p.points
    })

    const byGrade: {[grade: string]: any[]} = {}
    const gradesOwned = new Set<string>()
    for (let g = 1; g <= 6; g++) {
      const gradeStr = String(g)
      const studentsInGrade = allStudents
        .filter(s => s.grade_level === gradeStr)
        .map(s => ({ id: s.id, name: s.name, points: totals[s.id] || 0 }))
        .sort((a, b) => b.points - a.points)
      byGrade[gradeStr] = studentsInGrade
      if (studentsInGrade.length > 0) gradesOwned.add(gradeStr)
    }

    setAllRankings(byGrade)
    setMyGrades(gradesOwned)
    setLoading(false)
  }

  const gradeNames: {[key:string]:string} = {
    "1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"
  }
  const gradeColors: {[key:string]:string} = {
    "1":"#2563eb","2":"#16a34a","3":"#9333ea","4":"#ea580c","5":"#0891b2","6":"#be185d"
  }

  const medals = ["🥇", "🥈", "🥉"]

  const chooseGrade = (grade: string) => {
    setSelectedGrade(grade)
    setScreen('result')
  }

  const backToLevels = () => {
    setSelectedGrade('')
    setScreen('levels')
  }

  if (loading) return (
    <>
      <TeacherNav active="leaderboard" />
      <div dir="rtl" style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
        <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
      </div>
    </>
  )

  const isMine = myGrades.has(selectedGrade)
  const resultStudents = allRankings[selectedGrade] || []

  return (
    <>
      <TeacherNav active="leaderboard" />
      <main dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)",fontFamily:"Arial"}}>

        <div style={{maxWidth:"900px",margin:"0 auto",padding:"24px"}}>

          {/* ---------- الشاشة 1: أيقونة الانطلاق ---------- */}
          {screen === 'start' && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:"20px"}}>
              <button
                onClick={() => setScreen('levels')}
                style={{
                  width:"140px", height:"140px", borderRadius:"50%",
                  background:"linear-gradient(135deg,#f59e0b,#d97706)",
                  border:"none", cursor:"pointer",
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 8px 24px rgba(217,119,6,0.35)",
                  transition:"transform 0.15s",
                }}
                onMouseOver={e => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span style={{fontSize:"46px"}}>🏆</span>
              </button>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:"19px",fontWeight:"bold",color:"#1e293b",margin:0}}>لوحة الصدارة</p>
                <p style={{fontSize:"14px",color:"#6b7280",marginTop:"6px"}}>اضغط لاختيار المستوى وعرض ترتيب فصلك</p>
              </div>
            </div>
          )}

          {/* ---------- الشاشة 2: اختيار المستوى ---------- */}
          {screen === 'levels' && (
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"24px"}}>
                <button onClick={() => setScreen('start')}
                  style={{background:"#f3f4f6",color:"#6b7280",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                  → رجوع
                </button>
                <h2 style={{color:"#1e293b",fontSize:"19px",fontWeight:"bold",margin:0}}>اختر المستوى الذي تدرّسه</h2>
                <span style={{width:"70px"}}></span>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"14px"}}>
                {["1","2","3","4","5","6"].map(grade => {
                  const color = gradeColors[grade]
                  const mine = myGrades.has(grade)
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
                          فصلك
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

              {!hasAnyStudent && (
                <div style={{background:"#fffbeb",border:"1px solid #fcd34d",color:"#92400e",padding:"12px 16px",borderRadius:"10px",marginTop:"20px",fontSize:"14px",textAlign:"center"}}>
                  💡 لا يوجد بعد أي تلميذ منضمّ إلى فصولك، لذا لن تظهر أيّة لوحة كـ"فصلك" حتى ينضمّ أول تلميذ.
                </div>
              )}
            </div>
          )}

          {/* ---------- الشاشة 3: النتيجة ---------- */}
          {screen === 'result' && (
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
                <button onClick={backToLevels}
                  style={{background:"#f3f4f6",color:"#6b7280",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                  → مستوى آخر
                </button>
                <p style={{color:"#6b7280",fontSize:"13px",margin:0}}>{weekLabel}</p>
              </div>

              {!isMine ? (
                // ----- رسالة: هذا ليس مستوى الأستاذ -----
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
                // ----- لوحة صدارة المستوى -----
                <div style={{background:"white",borderRadius:"16px",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
                  <div style={{background:gradeColors[selectedGrade],color:"white",padding:"16px 20px",fontWeight:"bold",fontSize:"17px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span>🏫 السنة {gradeNames[selectedGrade]} ابتدائي</span>
                    <span style={{fontSize:"13px",opacity:0.9}}>{resultStudents.length} تلميذ</span>
                  </div>
                  <div style={{padding:"14px"}}>
                    {resultStudents.length === 0 ? (
                      <p style={{textAlign:"center", color:"#9ca3af", fontSize:"14px", padding:"24px 0"}}>
                        لا يوجد تلاميذ في هذا المستوى بعد
                      </p>
                    ) : (
                      resultStudents.map((student, i) => (
                        <div key={student.id} style={{
                          display:"flex", alignItems:"center", justifyContent:"space-between",
                          padding:"12px 10px",
                          borderBottom: i < resultStudents.length-1 ? "1px solid #f3f4f6" : "none",
                          background: i < 3 ? "#fef9c3" : "transparent",
                          borderRadius: i < 3 ? "8px" : "0"
                        }}>
                          <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
                            <span style={{fontSize: i < 3 ? "22px" : "14px", fontWeight:"bold", width:"26px", textAlign:"center"}}>
                              {i < 3 ? medals[i] : i + 1}
                            </span>
                            <span style={{fontSize:"15px", color:"#1e293b", fontWeight: i < 3 ? "bold" : "normal"}}>
                              {student.name}
                            </span>
                          </div>
                          <span style={{fontSize:"14px", color:"#ca8a04", fontWeight:"bold"}}>
                            ⭐ {student.points}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  )
}