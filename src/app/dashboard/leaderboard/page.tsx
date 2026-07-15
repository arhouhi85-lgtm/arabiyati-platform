'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true)
  const [ranking, setRanking] = useState<any[]>([])
  const [myGrade, setMyGrade] = useState('')
  const [myId, setMyId] = useState('')
  const [weekLabel, setWeekLabel] = useState('')

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const getWeekStart = () => {
    const now = new Date()
    const day = now.getDay() // 0=الأحد
    const diff = day === 0 ? 6 : day - 1 // نعتبر الاثنين بداية الأسبوع
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  }

  const loadLeaderboard = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { setLoading(false); return }
    setMyId(session.user.id)

    const { data: myUser } = await supabase
      .from('users').select('grade_level').eq('id', session.user.id).single()

    if (!myUser?.grade_level) { setLoading(false); return }
    setMyGrade(myUser.grade_level)

    const { data: gradeUsers } = await supabase
      .from('users').select('id, name').eq('grade_level', myUser.grade_level)

    if (!gradeUsers || gradeUsers.length === 0) { setLoading(false); return }

    const weekStart = getWeekStart()
    const monthNames = ['يناير','فبراير','مارس','أبريل','ماي','يونيو','يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر']
    setWeekLabel(`أسبوع ${weekStart.getDate()} ${monthNames[weekStart.getMonth()]}`)

    const userIds = gradeUsers.map(u => u.id)
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

    const rankedList = gradeUsers
      .map(u => ({ id: u.id, name: u.name, points: totals[u.id] || 0 }))
      .sort((a, b) => b.points - a.points)

    setRanking(rankedList)
    setLoading(false)
  }

  const gradeNames: {[key:string]:string} = {
    "1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"
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
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>🏆 لوحة الصدارة</h1>
        <a href="/dashboard/student" style={{color:"#6b7280",textDecoration:"none",fontWeight:"bold",background:"#f3f4f6",padding:"8px 14px",borderRadius:"8px"}}>
          رجوع
        </a>
      </nav>

      <div style={{maxWidth:"700px",margin:"0 auto",padding:"24px"}}>

        {!myGrade ? (
          <div style={{background:"white",borderRadius:"16px",padding:"32px",textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>⚠️</div>
            <p style={{color:"#6b7280",fontSize:"16px"}}>
              لم يتم تحديد سنتك الدراسية بعد. يرجى التواصل مع أستاذك.
            </p>
          </div>
        ) : (
          <>
            <div style={{background:"linear-gradient(135deg,#f59e0b,#d97706)",borderRadius:"16px",padding:"20px",marginBottom:"20px",textAlign:"center",color:"white"}}>
              <p style={{fontSize:"18px",fontWeight:"bold",margin:0}}>
                🏫 السنة {gradeNames[myGrade]} ابتدائي
              </p>
              <p style={{fontSize:"13px",opacity:0.9,marginTop:"4px"}}>{weekLabel}</p>
            </div>

            {ranking.length === 0 ? (
              <div style={{background:"white",borderRadius:"16px",padding:"32px",textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
                <div style={{fontSize:"48px",marginBottom:"12px"}}>📚</div>
                <p style={{color:"#6b7280",fontSize:"16px"}}>لا يوجد تلاميذ في مستواك بعد</p>
              </div>
            ) : (
              <div style={{background:"white",borderRadius:"16px",padding:"12px",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
                {ranking.map((student, i) => {
                  const isMe = student.id === myId
                  return (
                    <div key={student.id} style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"16px", marginBottom: i < ranking.length-1 ? "8px" : 0,
                      borderRadius:"12px",
                      background: isMe ? "#dbeafe" : (i < 3 ? "#fef9c3" : "#f9fafb"),
                      border: isMe ? "2px solid #2563eb" : "2px solid transparent"
                    }}>
                      <div style={{display:"flex", alignItems:"center", gap:"14px"}}>
                        <div style={{
                          width:"36px", height:"36px", borderRadius:"50%",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize: i < 3 ? "24px" : "16px", fontWeight:"bold",
                          background: i < 3 ? "transparent" : "#e5e7eb",
                          color: "#374151"
                        }}>
                          {i < 3 ? medals[i] : i + 1}
                        </div>
                        <div>
                          <p style={{margin:0, fontWeight:"bold", color:"#1e293b", fontSize:"15px"}}>
                            {student.name} {isMe && <span style={{color:"#2563eb"}}>(أنت)</span>}
                          </p>
                        </div>
                      </div>
                      <div style={{
                        background:"#fef9c3", color:"#ca8a04", padding:"6px 14px",
                        borderRadius:"20px", fontWeight:"bold", fontSize:"14px"
                      }}>
                        ⭐ {student.points}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <p style={{textAlign:"center", color:"#9ca3af", fontSize:"12px", marginTop:"16px"}}>
              تُحسب النقاط بدءاً من يوم الاثنين من كل أسبوع
            </p>
          </>
        )}
      </div>
    </main>
  )
}