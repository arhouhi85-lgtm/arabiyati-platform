'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function StudentDashboard() {
  const [points, setPoints] = useState(0)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [classId, setClassId] = useState<number|null>(null)
  const [className, setClassName] = useState('')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { setLoading(false); return }
    setUserId(session.user.id)

    const { data: userData } = await supabase
      .from('users').select('name, class_id, role').eq('id', session.user.id).single()
    if (userData?.role === 'teacher') { window.location.href = '/dashboard/teacher'; return }
    if (userData) {
      setUserName(userData.name)
      setClassId(userData.class_id)
      if (userData.class_id) {
        const { data: classData } = await supabase
          .from('classes').select('name').eq('id', userData.class_id).single()
        if (classData) setClassName(classData.name)
      }
    }

    const { data: pointsData } = await supabase
      .from('points').select('*').eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (pointsData) {
      const total = pointsData.reduce((sum: number, p: any) => sum + p.points, 0)
      setPoints(total)
      setHistory(pointsData)
    }
    setLoading(false)
  }

  const handleJoinClass = async () => {
    setJoinError('')
    if (!joinCode.trim()) return
    setJoining(true)

    const { data: foundClass } = await supabase
      .from('classes').select('id, name').eq('join_code', joinCode.trim().toUpperCase()).single()

    if (!foundClass) {
      setJoinError('رمز الفصل غير صحيح. تحقق منه مع أستاذك')
      setJoining(false)
      return
    }

    await supabase.from('users').update({ class_id: foundClass.id }).eq('id', userId)
    setClassId(foundClass.id)
    setClassName(foundClass.name)
    setShowJoinModal(false)
    setJoinCode('')
    setJoining(false)
  }

  const levels = [
    { level: 1, name: "مبتدئ", min: 0, max: 100, color: "#6b7280" },
    { level: 2, name: "متعلم", min: 100, max: 300, color: "#2563eb" },
    { level: 3, name: "متقدم", min: 300, max: 600, color: "#9333ea" },
    { level: 4, name: "محترف", min: 600, max: 1000, color: "#16a34a" },
    { level: 5, name: "خبير", min: 1000, max: 2000, color: "#ca8a04" },
  ]

  const currentLevel = levels.find(l => points >= l.min && points < l.max) || levels[0]
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1)
  const progress = nextLevel ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100

  const subjectBadgeDefs = [
    { subject: "القراءة", name: "قارئ متميز", icon: "📖", color: "#2563eb", min: 50 },
    { subject: "الصرف", name: "نجم الصرف", icon: "⭐", color: "#ca8a04", min: 50 },
    { subject: "التراكيب", name: "بطل التراكيب", icon: "🏆", color: "#16a34a", min: 50 },
    { subject: "الاملاء", name: "خبير الإملاء", icon: "✏️", color: "#9333ea", min: 50 },
    { subject: "التعبير الكتابي", name: "متفوق المستوى", icon: "🌟", color: "#ec4899", min: 50 },
    { subject: "التواصل الشفهي", name: "أستاذ اللغة", icon: "👑", color: "#f97316", min: 50 },
  ]

  const badges = subjectBadgeDefs.map(b => {
    const subjectTotal = history
      .filter((h: any) => h.lesson && h.lesson.includes(b.subject))
      .reduce((sum: number, h: any) => sum + h.points, 0)
    return { ...b, earned: subjectTotal >= b.min, subjectTotal }
  })

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'badges', label: 'شاراتي', icon: '🏆' },
    { id: 'history', label: 'السجل', icon: '📋' },
  ]

  if (loading) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>

      {showJoinModal && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"white",borderRadius:"20px",padding:"32px",width:"360px",textAlign:"center"}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>🏫</div>
            <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"8px"}}>الانضمام إلى فصل</h3>
            <p style={{color:"#6b7280",fontSize:"14px",marginBottom:"20px"}}>أدخل الرمز الذي أعطاك إياه أستاذك</p>

            {joinError && (
              <div style={{background:"#fee2e2",color:"#ef4444",padding:"10px",borderRadius:"8px",marginBottom:"16px",fontSize:"13px"}}>
                {joinError}
              </div>
            )}

            <input
              type="text"
              placeholder="مثال: A3X9K2"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{width:"100%",padding:"14px",borderRadius:"10px",border:"2px solid #e5e7eb",marginBottom:"20px",fontSize:"20px",boxSizing:"border-box",textAlign:"center",fontWeight:"bold",letterSpacing:"4px"}}
            />

            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={handleJoinClass} disabled={joining || !joinCode.trim()}
                style={{flex:1,background:"#2563eb",color:"white",border:"none",padding:"12px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px",opacity: joinCode.trim() ? 1 : 0.5}}>
                {joining ? "..." : "انضمام ✓"}
              </button>
              <button onClick={()=>{setShowJoinModal(false);setJoinError('');setJoinCode('')}}
                style={{flex:1,background:"#f3f4f6",color:"#6b7280",border:"none",padding:"12px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>عربيتي — لوحة التلميذ</h1>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{background:"#fef9c3",color:"#ca8a04",padding:"6px 16px",borderRadius:"20px",fontWeight:"bold"}}>
            ⭐ {points} نقطة
          </span>
          <a href="/dashboard/student/community" style={{background:"#eff6ff",color:"#2563eb",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            🌐 مجتمع المعرفة
          </a>
          <a href="/dashboard/student/chat" style={{background:"#fefce8",color:"#ca8a04",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            💬 أستاذي
          </a>
          <a href="/dashboard/student/attendance" style={{background:"#f0fdf4",color:"#16a34a",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            📋 غياباتي
          </a>
          <a href="/dashboard/leaderboard" style={{background:"#fef9c3",color:"#ca8a04",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            🏆 لوحة الصدارة
          </a>
          <a href="/levels/primary" style={{background:"#dbeafe",color:"#2563eb",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            الدروس
          </a>
          <a href="/" style={{background:"#fee2e2",color:"#ef4444",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            خروج
          </a>
        </div>
      </nav>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"24px"}}>

        {/* قسم الفصل */}
        <div style={{background:"white",borderRadius:"14px",padding:"16px 20px",marginBottom:"20px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          {classId ? (
            <>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <span style={{fontSize:"22px"}}>🏫</span>
                <div>
                  <p style={{margin:0,fontSize:"13px",color:"#9ca3af"}}>فصلي</p>
                  <p style={{margin:0,fontWeight:"bold",color:"#1e293b"}}>{className}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <span style={{fontSize:"22px"}}>🏫</span>
                <p style={{margin:0,color:"#9ca3af",fontSize:"14px"}}>لم تنضم لأي فصل بعد</p>
              </div>
              <button onClick={()=>setShowJoinModal(true)}
                style={{background:"#2563eb",color:"white",border:"none",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"13px"}}>
                + الانضمام إلى فصل
              </button>
            </>
          )}
        </div>

        <div style={{background:`linear-gradient(135deg, ${currentLevel.color}, #1e3a8a)`,borderRadius:"16px",padding:"24px",marginBottom:"24px",color:"white"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
            <div>
              <h2 style={{fontSize:"24px",fontWeight:"bold",margin:0}}>
                مرحباً {userName} 👋
              </h2>
              <p style={{opacity:0.8,marginTop:"8px"}}>
                المستوى {currentLevel.level} — {currentLevel.name} | {points} نقطة
                {nextLevel && ` — يتبقى ${nextLevel.min - points} نقطة للمستوى التالي`}
              </p>
            </div>
            <div style={{fontSize:"64px"}}>👑</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.3)",borderRadius:"8px",height:"12px"}}>
            <div style={{background:"white",borderRadius:"8px",height:"12px",width:`${Math.min(progress,100)}%`,transition:"width 0.5s"}}></div>
          </div>
        </div>

        <div style={{display:"flex",gap:"8px",marginBottom:"24px",background:"white",padding:"8px",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{padding:"10px 20px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"bold",fontSize:"15px",flex:1,
                background:activeTab === tab.id ? "#2563eb" : "transparent",
                color:activeTab === tab.id ? "white" : "#6b7280"}}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"24px"}}>
              <div style={{background:"white",borderRadius:"16px",padding:"20px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
                <div style={{fontSize:"36px",marginBottom:"8px"}}>⭐</div>
                <div style={{fontSize:"28px",fontWeight:"bold",color:"#ca8a04"}}>{points}</div>
                <div style={{color:"#6b7280"}}>النقاط</div>
              </div>
              <div style={{background:"white",borderRadius:"16px",padding:"20px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
                <div style={{fontSize:"36px",marginBottom:"8px"}}>🏆</div>
                <div style={{fontSize:"28px",fontWeight:"bold",color:"#16a34a"}}>{badges.filter(b => b.earned).length}</div>
                <div style={{color:"#6b7280"}}>الشارات</div>
              </div>
              <div style={{background:"white",borderRadius:"16px",padding:"20px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
                <div style={{fontSize:"36px",marginBottom:"8px"}}>📚</div>
                <div style={{fontSize:"28px",fontWeight:"bold",color:"#2563eb"}}>{history.length}</div>
                <div style={{color:"#6b7280"}}>الدروس</div>
              </div>
              <div style={{background:"white",borderRadius:"16px",padding:"20px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
                <div style={{fontSize:"36px",marginBottom:"8px"}}>🎯</div>
                <div style={{fontSize:"28px",fontWeight:"bold",color:"#9333ea"}}>{currentLevel.level}</div>
                <div style={{color:"#6b7280"}}>المستوى</div>
              </div>
            </div>

            <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
              <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>آخر الدروس</h3>
              {history.length === 0 ? (
                <div style={{textAlign:"center",padding:"40px",color:"#6b7280"}}>
                  <div style={{fontSize:"48px",marginBottom:"8px"}}>📚</div>
                  <p>لم تكمل أي درس بعد — ابدأ الآن!</p>
                  <a href="/levels/primary">
                    <button style={{background:"#2563eb",color:"white",border:"none",padding:"12px 24px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",marginTop:"12px"}}>
                      ابدأ التعلم 🚀
                    </button>
                  </a>
                </div>
              ) : (
                history.slice(0,5).map((h:any,i:number) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px",borderBottom:"1px solid #f3f4f6"}}>
                    <div>
                      <div style={{fontWeight:"bold",color:"#374151"}}>{h.lesson}</div>
                      <div style={{color:"#6b7280",fontSize:"13px"}}>{new Date(h.created_at).toLocaleDateString('ar-MA')}</div>
                    </div>
                    <div style={{background:"#fef9c3",color:"#ca8a04",padding:"4px 12px",borderRadius:"20px",fontWeight:"bold"}}>
                      +{h.points} ⭐
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"24px"}}>شاراتي 🏆</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px"}}>
              {badges.map((badge,i) => (
                <div key={i} style={{textAlign:"center",padding:"24px",border:`2px solid ${badge.earned ? badge.color : "#e5e7eb"}`,borderRadius:"16px",
                  background:badge.earned ? "#f9fafb" : "#f3f4f6",opacity:badge.earned ? 1 : 0.5}}>
                  <div style={{fontSize:"48px",marginBottom:"8px"}}>{badge.icon}</div>
                  <div style={{fontWeight:"bold",color:badge.earned ? badge.color : "#9ca3af",fontSize:"16px"}}>{badge.name}</div>
                  <div style={{color:"#6b7280",fontSize:"13px",marginTop:"4px"}}>
                    {badge.earned ? "✅ مكتسبة" : `🔒 ${badge.subjectTotal}/${badge.min} نقطة`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>سجل النشاط 📋</h3>
            {history.length === 0 ? (
              <p style={{textAlign:"center",color:"#6b7280",padding:"40px"}}>لا يوجد نشاط بعد</p>
            ) : (
              history.map((h:any,i:number) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"12px",borderBottom:"1px solid #f3f4f6"}}>
                  <div>
                    <div style={{fontWeight:"bold"}}>{h.lesson}</div>
                    <div style={{color:"#6b7280",fontSize:"13px"}}>{new Date(h.created_at).toLocaleDateString('ar-MA')}</div>
                  </div>
                  <span style={{background:"#fef9c3",color:"#ca8a04",padding:"4px 12px",borderRadius:"20px",fontWeight:"bold"}}>
                    +{h.points} ⭐
                  </span>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  )
}