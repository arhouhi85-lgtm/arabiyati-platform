'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!email) {
      setError('يرجى كتابة بريدك الإلكتروني')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError('تعذر إرسال الرسالة، تأكد من كتابة البريد بشكل صحيح ثم حاول مجدداً')
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <div style={{background:"white",borderRadius:"16px",padding:"40px",width:"100%",maxWidth:"420px",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>

        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{fontSize:"48px",marginBottom:"8px"}}>🔑</div>
          <h1 style={{color:"#2563eb",fontSize:"26px",fontWeight:"bold",marginBottom:"8px"}}>استرجاع كلمة المرور</h1>
          <p style={{color:"#6b7280",fontSize:"15px",lineHeight:"1.8"}}>
            اكتب بريدك الإلكتروني وسنرسل إليك رابطاً لتعيين كلمة مرور جديدة
          </p>
        </div>

        {sent ? (
          <div>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",padding:"16px",borderRadius:"10px",marginBottom:"20px",textAlign:"center",lineHeight:"1.9"}}>
              ✅ تم إرسال الرسالة بنجاح!<br/>
              افتح صندوق بريدك واضغط على الرابط الموجود في الرسالة.<br/>
              <span style={{fontSize:"13px",color:"#6b7280"}}>إن لم تجد الرسالة، تحقق من مجلد الرسائل غير المرغوبة (Spam)</span>
            </div>
            <a href="/auth/login">
              <button style={{width:"100%",background:"#6b7280",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"16px",fontWeight:"bold",cursor:"pointer"}}>
                العودة لتسجيل الدخول
              </button>
            </a>
          </div>
        ) : (
          <div>
            {error && (
              <div style={{background:"#fee2e2",color:"#ef4444",padding:"12px",borderRadius:"8px",marginBottom:"16px",textAlign:"center",fontWeight:"bold"}}>
                {error}
              </div>
            )}

            <div style={{marginBottom:"20px"}}>
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

            <button
              onClick={handleSend}
              disabled={loading}
              style={{width:"100%",background:"#2563eb",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"17px",fontWeight:"bold",cursor:"pointer",marginBottom:"16px"}}>
              {loading ? 'جارٍ الإرسال...' : 'إرسال رابط الاسترجاع 📧'}
            </button>

            <div style={{background:"#fef9c3",border:"1px solid #fbbf24",borderRadius:"10px",padding:"12px",fontSize:"13px",color:"#92400e",lineHeight:"1.8",marginBottom:"16px"}}>
              💡 نسيتَ بريدك الإلكتروني أيضاً؟ اسأل أستاذك أو الشخص الذي ساعدك في إنشاء الحساب.
            </div>

            <p style={{textAlign:"center"}}>
              <a href="/auth/login" style={{color:"#6b7280",textDecoration:"none",fontSize:"14px"}}>
                تذكرت كلمة المرور؟ العودة لتسجيل الدخول
              </a>
            </p>
          </div>
        )}

      </div>
    </main>
  )
}