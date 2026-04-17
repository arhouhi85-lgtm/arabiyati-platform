'use client'
import { useState } from 'react'

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    { label: "النقاط", value: "250", icon: "⭐", color: "#ca8a04", bg: "#fef9c3" },
    { label: "الدروس المكتملة", value: "8", icon: "📚", color: "#2563eb", bg: "#dbeafe" },
    { label: "التمارين", value: "15", icon: "✏️", color: "#9333ea", bg: "#f3e8ff" },
    { label: "الشارات", value: "3", icon: "🏆", color: "#16a34a", bg: "#dcfce7" },
  ]

  const badges = [
    { name: "قارئ متميز", icon: "📖", color: "#2563eb" },
    { name: "خبير الإملاء", icon: "✏️", color: "#9333ea" },
    { name: "نجم الصرف", icon: "⭐", color: "#ca8a04" },
  ]

  const recentLessons = [
    { title: "القراءة", unit: "الوحدة الأولى", score: 85, date: "اليوم" },
    { title: "الإملاء", unit: "الوحدة الأولى", score: 90, date: "أمس" },
    { title: "التراكيب", unit: "الوحدة الثانية", score: 75, date: "أمس" },
  ]

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'lessons', label: 'دروسي', icon: '📚' },
    { id: 'badges', label: 'شاراتي', icon: '🏆' },
    { id: 'progress', label: 'تقدمي', icon: '📈' },
  ]

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>

      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>
          عربيتي — لوحة التلميذ
        </h1>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{color:"#6b7280",fontWeight:"bold"}}>مرحباً 👋</span>
          <a href="/levels/primary" style={{background:"#dbeafe",color:"#2563eb",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            الدروس
          </a>
          <a href="/" style={{background:"#fee2e2",color:"#ef4444",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            خروج
          </a>
        </div>
      </nav>

      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"24px"}}>

        <div style={{display:"flex",gap:"8px",marginBottom:"24px",background:"white",padding:"8px",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{padding:"10px 20px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"bold",fontSize:"15px",
                background:activeTab === tab.id ? "#2563eb" : "transparent",
                color:activeTab === tab.id ? "white" : "#6b7280"}}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"24px"}}>
              {stats.map((stat,i) => (
                <div key={i} style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center"}}>
                  <div style={{fontSize:"40px",marginBottom:"8px"}}>{stat.icon}</div>
                  <div style={{fontSize:"32px",fontWeight:"bold",color:stat.color}}>{stat.value}</div>
                  <div style={{color:"#6b7280",fontSize:"14px"}}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:"16px"}}>
              <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
                <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>
                  📚 آخر الدروس
                </h3>
                {recentLessons.map((lesson,i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px",borderBottom:"1px solid #f3f4f6"}}>
                    <div>
                      <div style={{fontWeight:"bold",color:"#374151"}}>{lesson.title}</div>
                      <div style={{color:"#6b7280",fontSize:"14px"}}>{lesson.unit}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                      <div style={{background: lesson.score >= 80 ? "#dcfce7" : "#fef9c3",
                        color: lesson.score >= 80 ? "#16a34a" : "#ca8a04",
                        padding:"4px 12px",borderRadius:"20px",fontWeight:"bold"}}>
                        {lesson.score}%
                      </div>
                      <div style={{color:"#9ca3af",fontSize:"13px"}}>{lesson.date}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
                <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>
                  🏆 شاراتي
                </h3>
                {badges.map((badge,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px",borderBottom:"1px solid #f3f4f6"}}>
                    <div style={{fontSize:"32px"}}>{badge.icon}</div>
                    <div style={{fontWeight:"bold",color:badge.color}}>{badge.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>دروسي</h3>
            <a href="/levels/primary">
              <button style={{background:"#2563eb",color:"white",border:"none",padding:"12px 24px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"16px"}}>
                ابدأ درساً جديداً 🚀
              </button>
            </a>
          </div>
        )}

        {activeTab === 'badges' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>شاراتي 🏆</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px"}}>
              {badges.map((badge,i) => (
                <div key={i} style={{textAlign:"center",padding:"24px",border:"2px solid #e5e7eb",borderRadius:"16px"}}>
                  <div style={{fontSize:"48px",marginBottom:"8px"}}>{badge.icon}</div>
                  <div style={{fontWeight:"bold",color:badge.color,fontSize:"16px"}}>{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>تقدمي 📈</h3>
            <p style={{color:"#6b7280",textAlign:"center",padding:"40px"}}>
              سيتم إضافة تفاصيل التقدم قريباً 🚀
            </p>
          </div>
        )}

      </div>
    </main>
  )
}