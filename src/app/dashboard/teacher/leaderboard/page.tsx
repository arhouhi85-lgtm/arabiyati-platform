'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeacherLeaderboardPage() {
  const [loading, setLoading] = useState(true)
  const [allRankings, setAllRankings] = useState<{[grade: string]: any[]}>({})
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

    const { data: allStudents } = await supabase
      .from('users')
      .select('id, name, grade_level')
      .eq('role', 'student')
      .not('grade_level', 'is', null)

    if (!allStudents || allStudents.length === 0) {
      setLoading(false)
      return
    }

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
    for (let g = 1; g <= 6; g++) {
      const gradeStr = String(g)
      const studentsInGrade = allStudents
        .filter(s => s.grade_level === gradeStr)
        .map(s => ({ id: s.id, name: s.name, points: totals[s.id] || 0 }))
        .sort((a, b) => b.points - a.points)
      byGrade[gradeStr] = studentsInGrade
    }

    setAllRankings(byGrade)
    setLoading(false)
  }

  const gradeNames: {[key:string]:string} = {
    "1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"
  }
  const gradeColors: {[key:string]:string} = {
    "1":"#2563eb","2":"#16a34a","3":"#9333ea","4":"#ea580c","5":"#0891b2","6":"#be185d"
  }

  const medals = ["🥇", "🥈", "🥉"]

  if (loading) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>🏆 لوحة الصدارة — جميع المستويات</h1>
        <a href="/dashboard/teacher" style={{color:"#6b7280",textDecoration:"none",fontWeight:"bold",background:"#f3f4f6",padding:"8px 14px",borderRadius:"8px"}}>
          رجوع
        </a>
      </nav>

      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"24px"}}>
        <p style={{textAlign:"center", color:"#6b7280", fontSize:"14px", marginBottom:"20px"}}>{weekLabel}</p>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:"20px"}}>
          {["1","2","3","4","5","6"].map(grade => {
            const students = allRankings[grade] || []
            const color = gradeColors[grade]
            return (
              <div key={grade} style={{background:"white",borderRadius:"16px",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
                <div style={{background:color,color:"white",padding:"14px 18px",fontWeight:"bold",fontSize:"16px"}}>
                  🏫 السنة {gradeNames[grade]} ابتدائي
                  <span style={{float:"left",fontSize:"13px",opacity:0.9}}>{students.length} تلميذ</span>
                </div>
                <div style={{padding:"12px"}}>
                  {students.length === 0 ? (
                    <p style={{textAlign:"center", color:"#9ca3af", fontSize:"13px", padding:"20px 0"}}>
                      لا يوجد تلاميذ في هذا المستوى
                    </p>
                  ) : (
                    students.slice(0, 10).map((student, i) => (
                      <div key={student.id} style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"10px 8px",
                        borderBottom: i < students.length-1 ? "1px solid #f3f4f6" : "none",
                        background: i < 3 ? "#fef9c3" : "transparent",
                        borderRadius: i < 3 ? "8px" : "0"
                      }}>
                        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                          <span style={{fontSize: i < 3 ? "18px" : "13px", fontWeight:"bold", width:"22px", textAlign:"center"}}>
                            {i < 3 ? medals[i] : i + 1}
                          </span>
                          <span style={{fontSize:"14px", color:"#1e293b", fontWeight: i < 3 ? "bold" : "normal"}}>
                            {student.name}
                          </span>
                        </div>
                        <span style={{fontSize:"13px", color:"#ca8a04", fontWeight:"bold"}}>
                          ⭐ {student.points}
                        </span>
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