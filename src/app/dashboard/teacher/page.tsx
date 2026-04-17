'use client'
import { useState } from 'react'

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    { label: "عدد التلاميذ", value: "24", icon: "👨‍🎓", color: "#2563eb", bg: "#dbeafe" },
    { label: "الفصول", value: "2", icon: "🏫", color: "#16a34a", bg: "#dcfce7" },
    { label: "التمارين", value: "12", icon: "✏️", color: "#9333ea", bg: "#f3e8ff" },
    { label: "الواجبات", value: "5", icon: "📝", color: "#ea580c", bg: "#ffedd5" },
  ]

  const students = [
    { name: "أحمد محمد", level: "السنة الرابعة", score: 85, status: "نشيط" },
    { name: "فاطمة علي", level: "السنة الرابعة", score: 92, status: "نشيط" },
    { name: "يوسف حسن", level: "السنة الرابعة", score: 67, status: "يحتاج متابعة" },
    { name: "مريم أحمد", level: "السنة الرابعة", score: 78, status: "نشيط" },
    { name: "عمر خالد", level: "السنة الرابعة", score: 55, status: "يحتاج متابعة" },
  ]

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'students', label: 'التلاميذ', icon: '👨‍🎓' },
    { id: 'exercises', label: 'التمارين', icon: '✏️' },
    { id: 'homework', label: 'الواجبات', icon: '📝' },
    { id: 'reports', label: 'التقارير', icon: '📈' },
  ]

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      
      {/* الشريط العلوي */}
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>
          عربيتي — لوحة الأستاذ
        </h1>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{color:"#6b7280",fontWeight:"bold"}}>مرحباً أستاذ 👋</span>
          <a href="/" style={{background:"#fee2e2",color:"#ef4444",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            خروج
          </a>
        </div>
      </nav>

      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"24px"}}>

        {/* التبويبات */}
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

        {/* نظرة عامة */}
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

            {/* أحدث النشاطات */}
            <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
              <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>
                📊 أداء التلاميذ
              </h3>
              {students.map((s,i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px",borderBottom:"1px solid #f3f4f6"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                    <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",color:"#2563eb"}}>
                      {s.name[0]}
                    </div>
                    <div>
                      <div style={{fontWeight:"bold",color:"#374151"}}>{s.name}</div>
                      <div style={{color:"#6b7280",fontSize:"14px"}}>{s.level}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
                    <div style={{background: s.score >= 80 ? "#dcfce7" : s.score >= 60 ? "#fef9c3" : "#fee2e2",
                      color: s.score >= 80 ? "#16a34a" : s.score >= 60 ? "#ca8a04" : "#ef4444",
                      padding:"4px 12px",borderRadius:"20px",fontWeight:"bold"}}>
                      {s.score}%
                    </div>
                    <div style={{background: s.status === "نشيط" ? "#dcfce7" : "#fee2e2",
                      color: s.status === "نشيط" ? "#16a34a" : "#ef4444",
                      padding:"4px 12px",borderRadius:"20px",fontSize:"13px",fontWeight:"bold"}}>
                      {s.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* التلاميذ */}
        {activeTab === 'students' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",margin:0}}>قائمة التلاميذ</h3>
              <button style={{background:"#2563eb",color:"white",border:"none",padding:"10px 20px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                + إضافة تلميذ
              </button>
            </div>
            {students.map((s,i) => (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px",border:"1px solid #e5e7eb",borderRadius:"12px",marginBottom:"8px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{width:"48px",height:"48px",borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",color:"#2563eb",fontSize:"20px"}}>
                    {s.name[0]}
                  </div>
                  <div>
                    <div style={{fontWeight:"bold",color:"#374151",fontSize:"16px"}}>{s.name}</div>
                    <div style={{color:"#6b7280",fontSize:"14px"}}>{s.level}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:"8px"}}>
                  <button style={{background:"#dbeafe",color:"#2563eb",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                    عرض التقرير
                  </button>
                  <button style={{background:"#fee2e2",color:"#ef4444",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* التمارين */}
        {activeTab === 'exercises' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",margin:0}}>التمارين</h3>
              <button style={{background:"#2563eb",color:"white",border:"none",padding:"10px 20px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                + إضافة تمرين
              </button>
            </div>
            <p style={{color:"#6b7280",textAlign:"center",padding:"40px"}}>
              سيتم إضافة التمارين قريباً 🚀
            </p>
          </div>
        )}

        {/* الواجبات */}
        {activeTab === 'homework' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",margin:0}}>الواجبات</h3>
              <button style={{background:"#2563eb",color:"white",border:"none",padding:"10px 20px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                + إضافة واجب
              </button>
            </div>
            <p style={{color:"#6b7280",textAlign:"center",padding:"40px"}}>
              سيتم إضافة الواجبات قريباً 🚀
            </p>
          </div>
        )}

        {/* التقارير */}
        {activeTab === 'reports' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>التقارير</h3>
            <p style={{color:"#6b7280",textAlign:"center",padding:"40px"}}>
              سيتم إضافة التقارير قريباً 🚀
            </p>
          </div>
        )}

      </div>
    </main>
  )
}