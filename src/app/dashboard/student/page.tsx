'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState(1)
  const [activeTab, setActiveTab] = useState('overview')

  const badges = [
    { id: 1, name: "قارئ متميز", icon: "📖", color: "#2563eb", earned: points >= 50 },
    { id: 2, name: "خبير الإملاء", icon: "✏️", color: "#9333ea", earned: points >= 100 },
    { id: 3, name: "نجم الصرف", icon: "⭐", color: "#ca8a04", earned: points >= 150 },
    { id: 4, name: "بطل التراكيب", icon: "🏆", color: "#16a34a", earned: points >= 200 },
    { id: 5, name: "متفوق المستوى", icon: "🌟", color: "#ec4899", earned: points >= 300 },
    { id: 6, name: "أستاذ اللغة", icon: "👑", color: "#f97316", earned: points >= 500 },
  ]

  const levels = [
    { level: 1, name: "مبتدئ", min: 0, max: 100, color: "#6b7280" },
    { level: 2, name: "متعلم", min: 100, max: 250, color: "#2563eb" },
    { level: 3, name: "متقدم", min: 250, max: 500, color: "#9333ea" },
    { level: 4, name: "محترف", min: 500, max: 1000, color: "#16a34a" },
    { level: 5, name: "خبير", min: 1000, max: 2000, color: "#ca8a04" },
  ]

  const currentLevel = levels.find(l => points >= l.min && points < l.max) || levels[0]
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1)
  const progress = nextLevel ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100

  const recentActivities = [
    { title: "درس القراءة", points: 20, date: "اليوم", icon: "📖" },
    { title: "تمرين الإملاء", points: 15, date: "أمس", icon: "✏️" },
    { title: "اختبار التراكيب", points: 30, date: "أمس", icon: "📝" },
  ]

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'badges', label: 'شاراتي', icon: '🏆' },
    { id: 'levels', label: 'المستويات', icon: '⭐' },
    { id: 'history', label: 'السجل', icon: '📋' },
  ]

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>عربيتي — لوحة التلميذ</h1>
        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
          <span style={{background:"#fef9c3",color:"#ca8a04",padding:"6px 16px",borderRadius:"20px",fontWeight:"bold"}}>
            ⭐ {points} نقطة
          </span>
          <a href="/levels/primary" style={{background:"#dbeafe",color:"#2563eb",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            الدروس
          </a>
          <a href="/" style={{background:"#fee2e2",color:"#ef4444",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
            خروج
          </a>
        </div>
      </nav>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"24px"}}>

        {/* بطاقة المستوى */}
        <div style={{background:`linear-gradient(135deg, ${currentLevel.color}, #1e3a8a)`,borderRadius:"16px",padding:"24px",marginBottom:"24px",color:"white"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
            <div>
              <h2 style={{fontSize:"24px",fontWeight:"bold",margin:0}}>المستوى {currentLevel.level} — {currentLevel.name}</h2>
              <p style={{opacity:0.8,marginTop:"4px"}}>{points} نقطة {nextLevel ? `— يتبقى ${nextLevel.min - points} نقطة للمستوى التالي` : '— أعلى مستوى!'}</p>
            </div>
            <div style={{fontSize:"64px"}}>👑</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.3)",borderRadius:"8px",height:"12px"}}>
            <div style={{background:"white",borderRadius:"8px",height:"12px",width:`${progress}%`,transition:"width 0.5s"}}></div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"8px",fontSize:"14px",opacity:0.8}}>
            <span>{currentLevel.min} نقطة</span>
            <span>{nextLevel ? nextLevel.min : '∞'} نقطة</span>
          </div>
        </div>

        {/* التبويبات */}
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

        {/* نظرة عامة */}
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
                <div style={{fontSize:"28px",fontWeight:"bold",color:"#2563eb"}}>8</div>
                <div style={{color:"#6b7280"}}>الدروس</div>
              </div>
              <div style={{background:"white",borderRadius:"16px",padding:"20px",textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
                <div style={{fontSize:"36px",marginBottom:"8px"}}>🎯</div>
                <div style={{fontSize:"28px",fontWeight:"bold",color:"#9333ea"}}>{currentLevel.level}</div>
                <div style={{color:"#6b7280"}}>المستوى</div>
              </div>
            </div>

            {/* آخر النشاطات */}
            <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:"16px"}}>
              <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>آخر النشاطات</h3>
              {recentActivities.map((a,i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px",borderBottom:"1px solid #f3f4f6"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                    <span style={{fontSize:"24px"}}>{a.icon}</span>
                    <div>
                      <div style={{fontWeight:"bold",color:"#374151"}}>{a.title}</div>
                      <div style={{color:"#6b7280",fontSize:"14px"}}>{a.date}</div>
                    </div>
                  </div>
                  <div style={{background:"#fef9c3",color:"#ca8a04",padding:"4px 12px",borderRadius:"20px",fontWeight:"bold"}}>
                    +{a.points} ⭐
                  </div>
                </div>
              ))}
            </div>

            {/* زر اختبار النقاط */}
            <div style={{display:"flex",gap:"12px"}}>
              <button onClick={() => setPoints(p => p + 50)}
                style={{flex:1,background:"#16a34a",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"16px",fontWeight:"bold",cursor:"pointer"}}>
                +50 نقطة تجريبي ⭐
              </button>
              <button onClick={() => setPoints(p => Math.max(0, p - 50))}
                style={{flex:1,background:"#ef4444",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"16px",fontWeight:"bold",cursor:"pointer"}}>
                -50 نقطة تجريبي
              </button>
            </div>
          </div>
        )}

        {/* الشارات */}
        {activeTab === 'badges' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"24px"}}>شاراتي 🏆</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px"}}>
              {badges.map(badge => (
                <div key={badge.id} style={{textAlign:"center",padding:"24px",border:`2px solid ${badge.earned ? badge.color : "#e5e7eb"}`,borderRadius:"16px",
                  background:badge.earned ? "#f9fafb" : "#f3f4f6",opacity:badge.earned ? 1 : 0.5}}>
                  <div style={{fontSize:"48px",marginBottom:"8px"}}>{badge.icon}</div>
                  <div style={{fontWeight:"bold",color:badge.earned ? badge.color : "#9ca3af",fontSize:"16px"}}>{badge.name}</div>
                  <div style={{color:"#6b7280",fontSize:"13px",marginTop:"4px"}}>
                    {badge.earned ? "✅ مكتسبة" : "🔒 مقفلة"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* المستويات */}
        {activeTab === 'levels' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"24px"}}>المستويات ⭐</h3>
            {levels.map(l => (
              <div key={l.level} style={{display:"flex",alignItems:"center",gap:"16px",padding:"16px",borderRadius:"12px",marginBottom:"8px",
                background:l.level === currentLevel.level ? "#dbeafe" : "#f9fafb",
                border:`2px solid ${l.level === currentLevel.level ? l.color : "#e5e7eb"}`}}>
                <div style={{width:"48px",height:"48px",borderRadius:"50%",background:l.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"bold",fontSize:"20px"}}>
                  {l.level}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:"bold",color:"#374151",fontSize:"16px"}}>{l.name}</div>
                  <div style={{color:"#6b7280",fontSize:"14px"}}>{l.min} — {l.max} نقطة</div>
                </div>
                {points >= l.min && <span style={{color:l.color,fontWeight:"bold"}}>
                  {l.level === currentLevel.level ? "← أنت هنا" : "✅"}
                </span>}
              </div>
            ))}
          </div>
        )}

        {/* السجل */}
        {activeTab === 'history' && (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>سجل النشاط 📋</h3>
            {recentActivities.map((a,i) => (
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"12px",borderBottom:"1px solid #f3f4f6"}}>
                <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                  <span style={{fontSize:"24px"}}>{a.icon}</span>
                  <span style={{fontWeight:"bold"}}>{a.title}</span>
                </div>
                <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                  <span style={{color:"#6b7280"}}>{a.date}</span>
                  <span style={{background:"#fef9c3",color:"#ca8a04",padding:"4px 12px",borderRadius:"20px",fontWeight:"bold"}}>+{a.points} ⭐</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}