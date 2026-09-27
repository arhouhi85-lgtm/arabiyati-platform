'use client'
// ============================================================
//  صفحة الدخول الجديدة — بدون بريد إلكتروني وبدون كلمة مرور
//  المكان الصحيح لهذا الملف (يستبدل الملف القديم بنفس المسار):
//  src/app/auth/login/page.tsx
//
//  التدفّق:
//  1) اختيار "أستاذ" أو "تلميذ"
//  2) التلميذ: الاسم + رمز الفصل فقط
//     الأستاذ: الاسم + رقم سرّي من 4 أرقام (يُنشأ تلقائياً أول مرّة)
//  3) استدعاء /api/auth/login الذي يبني جلسة Supabase حقيقية
//  4) تفعيل الجلسة في المتصفّح عبر supabase.auth.setSession
//     ثم التوجيه للوحة المناسبة — كل الصفحات الأخرى تعمل بلا تعديل
// ============================================================
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BRAND, GRADIENTS } from '@/lib/brand'

type Choice = null | 'teacher' | 'student'

export default function LoginPage() {
  const router = useRouter()
  const [choice, setChoice] = useState<Choice>(null)
  const [name, setName] = useState('')
  const [classCode, setClassCode] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setChoice(null)
    setName('')
    setClassCode('')
    setPin('')
    setError('')
  }

  const handleSubmit = async () => {
    setError('')

    if (!name.trim()) {
      setError('الرجاء إدخال الاسم الكامل')
      return
    }
    if (choice === 'student' && !classCode.trim()) {
      setError('الرجاء إدخال رمز الفصل')
      return
    }
    if (choice === 'teacher' && !/^\d{4}$/.test(pin.trim())) {
      setError('الرقم السرّي يجب أن يكون 4 أرقام فقط')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          choice === 'student'
            ? { role: 'student', name: name.trim(), classCode: classCode.trim() }
            : { role: 'teacher', name: name.trim(), pin: pin.trim() }
        ),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ، حاول مجدداً')
        setLoading(false)
        return
      }

      // تفعيل الجلسة الحقيقية في المتصفّح — من هذه اللحظة كل صفحة
      // أخرى في المنصة (لوحة الأستاذ/التلميذ...) تعمل بشكل طبيعي تماماً
      const { error: sessionErr } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
      if (sessionErr) {
        setError('تعذّر تفعيل الجلسة، حاول مجدداً')
        setLoading(false)
        return
      }

      router.push(choice === 'teacher' ? '/dashboard/teacher' : '/dashboard/student')
    } catch (e) {
      setError('تعذّر الاتصال بالخادم، تحقّق من اتصالك بالإنترنت')
      setLoading(false)
    }
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: BRAND.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial',
        padding: '20px 0',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '18px',
          padding: '32px',
          width: '420px',
          maxWidth: '92vw',
          boxShadow: '0 6px 24px rgba(15,61,115,0.12)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src="/images/logo-mark.png"
            alt="عربيتي"
            style={{ height: '64px', objectFit: 'contain', marginBottom: '8px' }}
          />
        </div>

        {/* ---------- الشاشة الأولى: اختيار الدور ---------- */}
        {choice === null && (
          <>
            <h1
              style={{
                color: BRAND.navy,
                fontSize: '22px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              مرحباً بك، من أنت؟
            </h1>

            <button
              onClick={() => setChoice('teacher')}
              style={{
                width: '100%',
                background: GRADIENTS.navy,
                color: 'white',
                border: 'none',
                padding: '18px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '14px',
              }}
            >
              🎓 أستاذ(ة)
            </button>

            <button
              onClick={() => setChoice('student')}
              style={{
                width: '100%',
                background: BRAND.gold,
                color: 'white',
                border: 'none',
                padding: '18px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              📚 تلميذ(ة)
            </button>
          </>
        )}

        {/* ---------- شاشة الأستاذ ---------- */}
        {choice === 'teacher' && (
          <>
            <h1
              style={{
                color: BRAND.navy,
                fontSize: '20px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '18px',
              }}
            >
              🎓 دخول الأستاذ(ة)
            </h1>

            {error && <ErrorBox text={error} />}

            <input
              type="text"
              placeholder="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />

            <input
              type="password"
              inputMode="numeric"
              placeholder="الرقم السرّي (4 أرقام)"
              value={pin}
              maxLength={4}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              style={{ ...inputStyle, letterSpacing: '6px', textAlign: 'center', fontWeight: 'bold' }}
            />

            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '18px', lineHeight: 1.6 }}>
              أوّل مرّة تدخل فيها باسمك، سيُسجَّل هذا الرقم كرمزك السرّي
              تلقائياً — احفظه جيّداً، لأنك ستحتاجه في كل مرّة.
            </p>

            <SubmitButton loading={loading} onClick={handleSubmit} />
            <BackLink onClick={reset} />
          </>
        )}

        {/* ---------- شاشة التلميذ ---------- */}
        {choice === 'student' && (
          <>
            <h1
              style={{
                color: BRAND.navy,
                fontSize: '20px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '18px',
              }}
            >
              📚 دخول التلميذ(ة)
            </h1>

            {error && <ErrorBox text={error} />}

            <input
              type="text"
              placeholder="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="رمز الفصل (من أستاذك)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{ ...inputStyle, letterSpacing: '2px', textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}
            />

            <SubmitButton loading={loading} onClick={handleSubmit} />
            <BackLink onClick={reset} />
          </>
        )}
      </div>
    </main>
  )
}

// ---------------- مكوّنات صغيرة مشتركة ----------------

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '2px solid #e5e7eb',
  marginBottom: '12px',
  fontSize: '16px',
  boxSizing: 'border-box',
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div
      style={{
        background: '#fee2e2',
        color: '#ef4444',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        textAlign: 'center',
        fontSize: '14px',
      }}
    >
      {text}
    </div>
  )
}

function SubmitButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%',
        background: GRADIENTS.navy,
        color: 'white',
        border: 'none',
        padding: '14px',
        borderRadius: '10px',
        fontSize: '17px',
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      {loading ? 'جارٍ الدخول...' : 'دخول'}
    </button>
  )
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <p style={{ textAlign: 'center', marginTop: '16px' }}>
      <a
        onClick={onClick}
        style={{ color: BRAND.navy, fontWeight: 'bold', cursor: 'pointer' }}
      >
        ← رجوع
      </a>
    </p>
  )
}