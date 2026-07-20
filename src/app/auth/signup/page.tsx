'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BRAND, GRADIENTS } from '@/lib/brand'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [gradeLevel, setGradeLevel] = useState('1')
  const [classCode, setClassCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    setError('')

    let classId = null
    if (role === 'student' && classCode.trim()) {
      const { data: foundClass } = await supabase
        .from('classes')
        .select('id')
        .eq('join_code', classCode.trim().toUpperCase())
        .single()

      if (!foundClass) {
        setError('رمز الفصل غير صحيح. تحقق منه مع أستاذك')
        setLoading(false)
        return
      }
      classId = foundClass.id
    }

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError('حدث خطأ في إنشاء الحساب: ' + (error.message || ''))
      setLoading(false)
      return
    }

    // كشف البريد المسجل مسبقاً (Supabase لا يرجع خطأ بل مستخدماً وهمياً بلا هويات)
    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      setError('هذا البريد الإلكتروني مسجَّل مسبقاً — استعمل «تسجيل الدخول» أو «نسيت كلمة المرور»')
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        name: name,
        role: role,
        grade_level: role === 'student' ? gradeLevel : null,
        class_id: classId
      })
      // لا نتابع أبداً إن فشل حفظ الملف الشخصي (حتى لا يبقى حساب بلا دور)
      if (profileError) {
        setError('تعذر إكمال إنشاء الحساب، حاول مجدداً بعد لحظات')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
    }

    setLoading(false)
    if (role === 'teacher') {
      router.push('/dashboard/teacher')
    } else {
      router.push('/dashboard/student')
    }
  }

  const gradeLevels = [
    { value: '1', label: 'السنة الأولى ابتدائي' },
    { value: '2', label: 'السنة الثانية ابتدائي' },
    { value: '3', label: 'السنة الثالثة ابتدائي' },
    { value: '4', label: 'السنة الرابعة ابتدائي' },
    { value: '5', label: 'السنة الخامسة ابتدائي' },
    { value: '6', label: 'السنة السادسة ابتدائي' },
  ]

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:BRAND.cream,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial",padding:"20px 0"}}>
      <div style={{background:"white",borderRadius:"18px",padding:"32px",width:"420px",boxShadow:"0 6px 24px rgba(15,61,115,0.12)"}}>
        <div style={{textAlign:"center",marginBottom:"20px"}}>
          <img src="/images/logo-mark.png" alt="عربيتي" style={{height:"64px",objectFit:"contain",marginBottom:"8px"}}/>
        </div>
        <h1 style={{color:BRAND.navy,fontSize:"24px",fontWeight:"bold",textAlign:"center",marginBottom:"24px"}}>
          إنشاء حساب جديد
        </h1>

        {error && (
          <div style={{background:"#fee2e2",color:"#ef4444",padding:"12px",borderRadius:"8px",marginBottom:"16px",textAlign:"center",fontSize:"14px"}}>
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="الاسم الكامل"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{width:"100%",padding:"12px",borderRadius:"8px",border:"2px solid #e5e7eb",marginBottom:"12px",fontSize:"16px",boxSizing:"border-box"}}
        />

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{width:"100%",padding:"12px",borderRadius:"8px",border:"2px solid #e5e7eb",marginBottom:"12px",fontSize:"16px",boxSizing:"border-box"}}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{width:"100%",padding:"12px",borderRadius:"8px",border:"2px solid #e5e7eb",marginBottom:"12px",fontSize:"16px",boxSizing:"border-box"}}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{width:"100%",padding:"12px",borderRadius:"8px",border:"2px solid #e5e7eb",marginBottom:"12px",fontSize:"16px",boxSizing:"border-box"}}
        >
          <option value="student">تلميذ</option>
          <option value="teacher">أستاذ</option>
        </select>

        {role === 'student' && (
          <>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              style={{width:"100%",padding:"12px",borderRadius:"8px",border:"2px solid #e5e7eb",marginBottom:"12px",fontSize:"16px",boxSizing:"border-box"}}
            >
              {gradeLevels.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="رمز الفصل (اختياري - من أستاذك)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{width:"100%",padding:"12px",borderRadius:"8px",border:"2px solid #e5e7eb",marginBottom:"20px",fontSize:"16px",boxSizing:"border-box",letterSpacing:"2px",textAlign:"center",fontWeight:"bold"}}
            />
          </>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{width:"100%",background:GRADIENTS.navy,color:"white",border:"none",padding:"14px",borderRadius:"10px",fontSize:"17px",fontWeight:"bold",cursor:"pointer"}}
        >
          {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
        </button>

        <p style={{textAlign:"center",marginTop:"16px",color:"#6b7280"}}>
          لديك حساب؟ <a href="/auth/login" style={{color:BRAND.navy,fontWeight:"bold"}}>تسجيل الدخول</a>
        </p>
      </div>
    </main>
  )
}