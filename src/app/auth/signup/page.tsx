'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('يرجى ملء جميع الحقول')
      return
    }
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('حدث خطأ في إنشاء الحساب')
      setLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('users').insert({ id: data.user.id, name, role })
      if (role === 'teacher') {
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
          <p style={{color:"#6b7280",fontSize:"16px"}}>إنشاء حساب جديد</p>
        </div>

        {error && (
          <div style={{background:"#fee2e2",color:"#ef4444",padding:"12px",borderRadius:"8px",marginBottom:"16px",textAlign:"center",fontWeight:"bold"}}>
            {error}
          </div>
        )}

        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",marginBottom:"8px",fontWeight:"bold"}}>الاسم الكامل</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسمك"
            style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"12px",textAlign:"right",fontSize:"16px",boxSizing:"border-box"}}/>
        </div>

        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",marginBottom:"8px",fontWeight:"bold"}}>البريد الإلكتروني</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"12px",textAlign:"right",fontSize:"16px",boxSizing:"border-box"}}/>
        </div>

        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",marginBottom:"8px",fontWeight:"bold"}}>كلمة المرور</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"12px",textAlign:"right",fontSize:"16px",boxSizing:"border-box"}}/>
        </div>

        <div style={{marginBottom:"24px"}}>
          <label style={{display:"block",marginBottom:"8px",fontWeight:"bold"}}>أنا</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"12px",fontSize:"16px",boxSizing:"border-box"}}>
            <option value="student">تلميذ</option>
            <option value="teacher">أستاذ</option>
          </select>
        </div>

        <button onClick={handleSignup} disabled={loading}
          style={{width:"100%",background:"#ec4899",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"18px",fontWeight:"bold",cursor:"pointer",marginBottom:"16px"}}>
          {loading ? 'جاري التحميل' : 'إنشاء الحساب'}
        </button>

        <p style={{textAlign:"center",color:"#6b7280"}}>
          لديك حساب؟{' '}
          <a href="/auth/login" style={{color:"#2563eb",fontWeight:"bold",textDecoration:"none"}}>
            سجل دخولك
          </a>
        </p>

        <p style={{textAlign:"center",marginTop:"16px"}}>
          <a href="/" style={{color:"#6b7280",textDecoration:"none"}}>
            العودة للرئيسية
          </a>
        </p>

      </div>
    </main>
  )
}