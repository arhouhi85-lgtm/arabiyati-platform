'use client'
// ============================================================
//  useTeacherGuard.ts — حارس موحّد لصفحات الأستاذ
//  المكان: src/lib/useTeacherGuard.ts
//
//  الاستعمال في أي صفحة أستاذ (أول سطر داخل المكوّن):
//    const { loading, teacherId, teacherName } = useTeacherGuard()
//    if (loading) return <LoadingScreen />
//
//  يتحقّق من: (1) وجود جلسة دخول، (2) أن دور المستخدم = 'teacher'.
//  غير المسجَّل يُحوَّل لصفحة الدخول، والتلميذ يُحوَّل للوحته.
//  ⚠️ هذا خط دفاع إضافي على مستوى الواجهة فقط؛ الحماية الحقيقية
//  للبيانات تبقى دائماً في سياسات RLS في Supabase.
// ============================================================
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useTeacherGuard() {
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState('')
  const [teacherName, setTeacherName] = useState('')

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        window.location.href = '/auth/login'
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', session.user.id)
        .single()

      if (cancelled) return

      if (profile?.role !== 'teacher') {
        window.location.href = '/dashboard/student'
        return
      }

      setTeacherId(session.user.id)
      setTeacherName(profile?.name || '')
      setLoading(false)
    }

    check()
    return () => { cancelled = true }
  }, [])

  return { loading, teacherId, teacherName }
}