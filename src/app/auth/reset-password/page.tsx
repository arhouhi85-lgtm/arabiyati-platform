'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
      setChecking(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
        setChecking(false)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    if (!password || !confirm) {
      setError('يرجى ملء الحقلين معاً')
      return
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تتكون من 6 أحرف على الأقل')
      return
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('تعذر تغيير كلمة المرور، أعد فتح الرابط من بريدك وحاول مجدداً')
      setLoading(false)
      return
    }
    await supabase.auth.signOut()
    setDone(true)
    setLoading(false)
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <div style={{background:"white",borderRadius:"16px",padding:"40px",width:"100%",maxWidth:"420px",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>

        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{fontSize:"48px",marginBottom:"8px"}}>🔒</div>
          <h1 style={{color:"#2563eb",fontSize:"26px",fontWeight:"bold",marginBottom:"8px"}}>كلمة مرور جديدة</h1>
        </div>

        {checking ? (
          <p style={{textAlign:"center",color:"#6b7280",fontSize:"16px"}}>جارٍ التحقق...</p>
        ) : done ? (
          <div>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",padding:"16px",borderRadius:"10px",marginBottom:"20px",textAlign:"center",lineHeight:"1.9",fontWeight:"bold"}}>
              🎉 تم تغيير كلمة المرور بنجاح!<br/>
              يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
            </div>
            <a href="/auth/login">
              <button style={{width:"100%",background:"#2563eb",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"17px",fontWeight:"bold",cursor:"pointer"}}>
                تسجيل الدخول
              </button>
            </a>
          </div>
        ) : !ready ? (
          <div>
            <div style={{background:"#fee2e2",border:"1px solid #fca5a5",color:"#b91c1c",padding:"16px",borderRadius:"10px",marginBottom:"20px",textAlign:"center",lineHeight:"1.9"}}>
              ⚠️ هذه الصفحة تُفتح من الرابط المرسل إلى بريدك الإلكتروني فقط.<br/>
              الرابط قد يكون منتهي الصلاحية أو غير صالح.
            </div>
            <a href="/auth/forgot-password">
              <button style={{width:"100%",background:"#2563eb",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"16px",fontWeight:"bold",cursor:"pointer"}}>
                طلب رابط جديد
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

            <div style={{marginBottom:"16px"}}>
              <label style={{display:"block",marginBottom:"8px",fontWeight:"bold",color:"#374151"}}>
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"12px",textAlign:"right",fontSize:"16px",boxSizing:"border-box",outline:"none"}}
              />
            </div>

            <div style={{marginBottom:"24px"}}>
              <label style={{display:"block",marginBottom:"8px",fontWeight:"bold",color:"#374151"}}>
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="********"
                style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"12px",textAlign:"right",fontSize:"16px",boxSizing:"border-box",outline:"none"}}
              />
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              style={{width:"100%",background:"#2563eb",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"17px",fontWeight:"bold",cursor:"pointer"}}>
              {loading ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور الجديدة ✓'}
            </button>
          </div>
        )}

      </div>
    </main>
  )
}