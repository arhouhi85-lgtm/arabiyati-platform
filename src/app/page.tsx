'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BRAND, GRADIENTS } from '@/lib/brand'

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
    <main dir="rtl" style={{minHeight:"100vh",background:BRAND.cream,fontFamily:"Arial"}}>
      <nav style={{background:BRAND.white,padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 10px rgba(15,61,115,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <img src="/images/logo-mark.png" alt="عربيتي" style={{height:"46px",objectFit:"contain"}}/>
          <span style={{color:BRAND.navy,fontSize:"24px",fontWeight:"bold"}}>عربيتي</span>
        </div>
        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
          {user ? (
            <>
              {role === 'teacher' && (
                <a href="/dashboard/teacher">
                  <button style={{background:BRAND.navy,color:"white",padding:"9px 18px",borderRadius:"9px",border:"none",cursor:"pointer",fontWeight:"bold"}}>
                    👨‍🏫 لوحة الأستاذ
                  </button>
                </a>
              )}
              {role === 'student' && (
                <a href="/dashboard/student">
                  <button style={{background:BRAND.navy,color:"white",padding:"9px 18px",borderRadius:"9px",border:"none",cursor:"pointer",fontWeight:"bold"}}>
                    👨‍🎓 لوحتي
                  </button>
                </a>
              )}
              <button onClick={handleLogout}
                style={{background:"#fee2e2",color:"#ef4444",padding:"9px 18px",borderRadius:"9px",border:"none",cursor:"pointer",fontWeight:"bold"}}>
                خروج
              </button>
            </>
          ) : (
            <>
              <a href="/auth/login">
                <button style={{background:BRAND.creamDark,color:BRAND.navy,padding:"9px 18px",borderRadius:"9px",border:`1px solid ${BRAND.navy}30`,cursor:"pointer",fontWeight:"bold"}}>
                  تسجيل الدخول
                </button>
              </a>
              <a href="/auth/signup">
                <button style={{background:GRADIENTS.navyGold,color:"white",padding:"9px 18px",borderRadius:"9px",border:"none",cursor:"pointer",fontWeight:"bold"}}>
                  إنشاء حساب
                </button>
              </a>
            </>
          )}
        </div>
      </nav>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"50px 20px",textAlign:"center"}}>
        <img src="/images/logo-mark.png" alt="عربيتي" style={{height:"92px",objectFit:"contain",marginBottom:"20px"}}/>
        <h2 style={{color:BRAND.navy,fontSize:"40px",fontWeight:"bold",marginBottom:"12px"}}>
          مرحباً بك في عربيتي
        </h2>
        <div style={{width:"70px",height:"4px",background:BRAND.gold,margin:"0 auto 18px auto",borderRadius:"2px"}}/>
        <p style={{color:"#6b7280",fontSize:"19px",marginBottom:"44px"}}>
          منصة تعليمية شاملة للغة العربية لجميع المستويات
        </p>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"24px"}}>
          <a href="/levels/primary" style={{textDecoration:"none"}}>
            <div style={{background:"white",borderRadius:"16px",padding:"26px",boxShadow:"0 4px 16px rgba(15,61,115,0.10)",borderTop:`4px solid ${BRAND.navy}`,cursor:"pointer"}}>
              <div style={{fontSize:"46px",marginBottom:"12px"}}>🏫</div>
              <h3 style={{color:BRAND.navy,fontSize:"21px",fontWeight:"bold",marginBottom:"6px"}}>الابتدائي</h3>
              <p style={{color:"#6b7280",margin:0}}>السنوات من الأولى إلى السادسة</p>
            </div>
          </a>
          <a href="/levels/middle" style={{textDecoration:"none"}}>
            <div style={{background:"white",borderRadius:"16px",padding:"26px",boxShadow:"0 4px 16px rgba(15,61,115,0.10)",borderTop:`4px solid ${BRAND.gold}`,cursor:"pointer"}}>
              <div style={{fontSize:"46px",marginBottom:"12px"}}>🎓</div>
              <h3 style={{color:BRAND.goldDark,fontSize:"21px",fontWeight:"bold",marginBottom:"6px"}}>الإعدادي</h3>
              <p style={{color:"#6b7280",margin:0}}>السنوات من الأولى إلى الثالثة</p>
            </div>
          </a>
          <a href="/levels/high" style={{textDecoration:"none"}}>
            <div style={{background:"white",borderRadius:"16px",padding:"26px",boxShadow:"0 4px 16px rgba(15,61,115,0.10)",borderTop:`4px solid ${BRAND.navyLight}`,cursor:"pointer"}}>
              <div style={{fontSize:"46px",marginBottom:"12px"}}>🏛️</div>
              <h3 style={{color:BRAND.navyLight,fontSize:"21px",fontWeight:"bold",marginBottom:"6px"}}>الثانوي</h3>
              <p style={{color:"#6b7280",margin:0}}>السنوات من الأولى إلى الثالثة</p>
            </div>
          </a>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginTop:"40px"}}>
          <div style={{background:"white",borderRadius:"16px",padding:"18px",boxShadow:"0 2px 10px rgba(15,61,115,0.08)"}}>
            <div style={{color:BRAND.navy,fontSize:"32px",fontWeight:"bold"}}>12</div>
            <div style={{color:"#6b7280"}}>مستوى دراسي</div>
          </div>
          <div style={{background:"white",borderRadius:"16px",padding:"18px",boxShadow:"0 2px 10px rgba(15,61,115,0.08)"}}>
            <div style={{color:BRAND.gold,fontSize:"32px",fontWeight:"bold"}}>+100</div>
            <div style={{color:"#6b7280"}}>درس تفاعلي</div>
          </div>
          <div style={{background:"white",borderRadius:"16px",padding:"18px",boxShadow:"0 2px 10px rgba(15,61,115,0.08)"}}>
            <div style={{color:BRAND.navyLight,fontSize:"32px",fontWeight:"bold"}}>+500</div>
            <div style={{color:"#6b7280"}}>تمرين متنوع</div>
          </div>
        </div>

        <p style={{marginTop:"50px",color:BRAND.goldDark,fontSize:"14px",fontWeight:"bold",letterSpacing:"1px"}}>
          ARBIYATI — YOUR ARABIC IDENTITY
        </p>
      </div>
    </main>
  )
}