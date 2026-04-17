'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول')
      return
    }
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (userData?.role === 'teacher') {
        window.location.href = '/dashboard/teacher'
      } else {
        window.location.href = '/dashboard/student'
      }
    }
    setLoading(false)
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <div style={{background:"white",borderRadius:"16px",padding:"40px",width:"100%",maxWidth:"420px",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>

        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <h1 style={{color:"#2563eb",fontSize:"32px",fontWeight:"bold",marginBottom:"8px"}}>عربيتي</h1>
          <p style={{color:"#6b7280",fontSize:"16px"}}>سجل دخولك للمنصة</p>
        </div>

        {error && (
          <div style={{background:"#fee2e2",color:"#ef4444",padding:"12px",borderRadius:"8px",marginBottom:"16px",textAlign:"center",fontWeight:"bold"}}>
            {error}
          </div>
        )}

        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",marginBottom:"8px",fontWeight:"bold",color:"#374151"}}>
            البريد الإلكتروني
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"12px",textAlign:"right",fontSize:"16px",boxSizing:"border-box",outline:"none"}}
          />
        </div>

        <div style={{marginBottom:"24px"}}>
          <label style={{display:"block",marginBottom:"8px",fontWeight:"bold",color:"#374151"}}>
            كلمة المرور
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"12px",textAlign:"right",fontSize:"16px",boxSizing:"border-box",outline:"none"}}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{width:"100%",background:"#2563eb",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"18px",fontWeight:"bold",cursor:"pointer",marginBottom:"16px"}}>
          {loading ? 'جارٍ التحميل...' : 'تسجيل الدخول'}
        </button>

        <p style={{textAlign:"center",color:"#6b7280"}}>
          ليس لديك حساب؟{' '}
          <a href="/auth/signup" style={{color:"#ec4899",fontWeight:"bold",textDecoration:"none"}}>
            أنشئ حساباً
          </a>
        </p>

        <div style={{textAlign:"center",marginTop:"16px"}}>
          <a href="/" style={{color:"#6b7280",textDecoration:"none",fontSize:"14px"}}>
            العودة للصفحة الرئيسية
          </a>
        </div>

      </div>
    </main>
  )
}