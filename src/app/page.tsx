'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
        if (data) setRole(data.role)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole('')
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#eff6ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb",fontSize:"28px",fontWeight:"bold",margin:0}}>عربيتي</h1>
        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
          {user ? (
            <>
              {role === 'teacher' && (
                <a href="/dashboard/teacher">
                  <button style={{background:"#dcfce7",color:"#16a34a",padding:"8px 16px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"bold"}}>
                    👨‍🏫 لوحة الأستاذ
                  </button>
                </a>
              )}
              {role === 'student' && (
                <a href="/dashboard/student">
                  <button style={{background:"#dbeafe",color:"#2563eb",padding:"8px 16px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"bold"}}>
                    👨‍🎓 لوحتي
                  </button>
                </a>
              )}
              <button onClick={handleLogout}
                style={{background:"#fee2e2",color:"#ef4444",padding:"8px 16px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"bold"}}>
                خروج
              </button>
            </>
          ) : (
            <>
              <a href="/auth/login">
                <button style={{background:"#ec4899",color:"white",padding:"8px 16px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"bold"}}>
                  تسجيل الدخول
                </button>
              </a>
              <a href="/auth/signup">
                <button style={{background:"#2563eb",color:"white",padding:"8px 16px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"bold"}}>
                  إنشاء حساب
                </button>
              </a>
            </>
          )}
        </div>
      </nav>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"40px 20px",textAlign:"center"}}>
        <h2 style={{color:"#1e3a8a",fontSize:"40px",fontWeight:"bold",marginBottom:"16px"}}>
          مرحبا بك في عربيتي
        </h2>
        <p style={{color:"#6b7280",fontSize:"20px",marginBottom:"40px"}}>
          منصة تعليمية شاملة للغة العربية لجميع المستويات
        </p>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"24px"}}>
          <a href="/levels/primary" style={{textDecoration:"none"}}>
            <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",borderTop:"4px solid #60a5fa",cursor:"pointer"}}>
              <div style={{fontSize:"48px",marginBottom:"12px"}}>🏫</div>
              <h3 style={{color:"#1d4ed8",fontSize:"22px",fontWeight:"bold",marginBottom:"8px"}}>الابتدائي</h3>
              <p style={{color:"#6b7280"}}>السنوات من الأولى إلى السادسة</p>
            </div>
          </a>
          <a href="/levels/middle" style={{textDecoration:"none"}}>
            <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",borderTop:"4px solid #f472b6",cursor:"pointer"}}>
              <div style={{fontSize:"48px",marginBottom:"12px"}}>🎓</div>
              <h3 style={{color:"#be185d",fontSize:"22px",fontWeight:"bold",marginBottom:"8px"}}>الإعدادي</h3>
              <p style={{color:"#6b7280"}}>السنوات من الأولى إلى الثالثة</p>
            </div>
          </a>
          <a href="/levels/high" style={{textDecoration:"none"}}>
            <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",borderTop:"4px solid #c084fc",cursor:"pointer"}}>
              <div style={{fontSize:"48px",marginBottom:"12px"}}>🏛️</div>
              <h3 style={{color:"#7e22ce",fontSize:"22px",fontWeight:"bold",marginBottom:"8px"}}>الثانوي</h3>
              <p style={{color:"#6b7280"}}>السنوات من الأولى إلى الثالثة</p>
            </div>
          </a>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginTop:"40px"}}>
          <div style={{background:"white",borderRadius:"16px",padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
            <div style={{color:"#2563eb",fontSize:"32px",fontWeight:"bold"}}>12</div>
            <div style={{color:"#6b7280"}}>مستوى دراسي</div>
          </div>
          <div style={{background:"white",borderRadius:"16px",padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
            <div style={{color:"#ec4899",fontSize:"32px",fontWeight:"bold"}}>+100</div>
            <div style={{color:"#6b7280"}}>درس تفاعلي</div>
          </div>
          <div style={{background:"white",borderRadius:"16px",padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
            <div style={{color:"#7e22ce",fontSize:"32px",fontWeight:"bold"}}>+500</div>
            <div style={{color:"#6b7280"}}>تمرين متنوع</div>
          </div>
        </div>
      </div>
    </main>
  )
}