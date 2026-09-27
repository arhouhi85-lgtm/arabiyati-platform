// ============================================================
//  مسار الدخول الآمن الجديد — بدون بريد إلكتروني وبدون كلمة مرور
//  المكان الصحيح لهذا الملف:
//  src/app/api/auth/login/route.ts
//
//  هذا الملف يعمل على الخادم فقط (لا يصل إليه المتصفح مباشرة إلا
//  عبر fetch('/api/auth/login')). يستعمل "المفتاح السرّي" الكامل
//  لـ Supabase (service_role) لإنشاء/التحقّق من الحسابات، ثم يبني
//  جلسة Supabase حقيقية وسليمة تماماً كما كانت مع البريد وكلمة
//  المرور — لذلك كل صفحات الأستاذ والتلميذ وكل سياسات RLS
//  وكل الدوال (my_role, my_class_id) تستمر في العمل بلا أي تعديل.
//
//  يتطلّب متغيّر بيئة جديدا يجب إضافته في Vercel (انظر الشرح
//  المرفق في الرسالة، وليس في هذا الملف):
//    SUPABASE_SERVICE_ROLE_KEY
//  ويتطلّب تثبيت مكتبة واحدة صغيرة:
//    npm install bcryptjs
// ============================================================

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// عميل بصلاحيات كاملة (يتجاوز RLS) — لا يُستعمل إلا هنا على الخادم
const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// عميل عادي (بصلاحيات المستخدم العادي) — نستعمله فقط لتحويل الرابط
// السحري إلى جلسة حقيقية (access_token / refresh_token)
const anon = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type Body = {
  role: 'teacher' | 'student'
  name: string
  classCode?: string
  pin?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const role = body.role
    const nameRaw = (body.name || '').trim()

    if (!nameRaw) {
      return NextResponse.json({ error: 'الرجاء إدخال الاسم الكامل' }, { status: 400 })
    }
    if (nameRaw.length > 60) {
      return NextResponse.json({ error: 'الاسم طويل جداً' }, { status: 400 })
    }

    let userRow: { id: string; auth_email: string } | null = null

    // ============================================================
    // مسار التلميذ: الاسم + رمز الفصل فقط (بلا حماية، كما تمّ الاتفاق)
    // ============================================================
    if (role === 'student') {
      const classCode = (body.classCode || '').trim().toUpperCase()
      if (!classCode) {
        return NextResponse.json({ error: 'الرجاء إدخال رمز الفصل' }, { status: 400 })
      }

      const { data: cls, error: clsErr } = await admin
        .from('classes')
        .select('id')
        .eq('join_code', classCode)
        .maybeSingle()

      if (clsErr || !cls) {
        return NextResponse.json(
          { error: 'رمز الفصل غير صحيح. تحقّق منه مع أستاذك' },
          { status: 400 }
        )
      }
      const classId = cls.id

      const { data: existing } = await admin
        .from('users')
        .select('id, auth_email')
        .eq('role', 'student')
        .eq('class_id', classId)
        .ilike('name', nameRaw)
        .maybeSingle()

      if (existing) {
        userRow = existing as any
      } else {
        userRow = await createSilentAccount({
          name: nameRaw,
          role: 'student',
          classId,
        })
        if (!userRow) {
          return NextResponse.json(
            { error: 'تعذّر إنشاء الحساب، حاول مجدداً بعد لحظات' },
            { status: 500 }
          )
        }
      }
    }

    // ============================================================
    // مسار الأستاذ: الاسم + رقم سرّي من 4 أرقام (يُنشأ أول مرّة تلقائياً)
    // ============================================================
    else if (role === 'teacher') {
      const pin = (body.pin || '').trim()
      if (!/^\d{4}$/.test(pin)) {
        return NextResponse.json(
          { error: 'الرقم السرّي يجب أن يكون 4 أرقام فقط' },
          { status: 400 }
        )
      }

      const { data: existing } = await admin
        .from('users')
        .select('id, auth_email, pin_hash')
        .eq('role', 'teacher')
        .ilike('name', nameRaw)
        .maybeSingle()

      if (existing) {
        const ok = existing.pin_hash ? await bcrypt.compare(pin, existing.pin_hash) : false
        if (!ok) {
          return NextResponse.json(
            { error: 'هذا الاسم مسجَّل مسبقاً، والرقم السرّي غير صحيح' },
            { status: 401 }
          )
        }
        userRow = existing as any
      } else {
        const pinHash = await bcrypt.hash(pin, 10)
        userRow = await createSilentAccount({
          name: nameRaw,
          role: 'teacher',
          pinHash,
        })
        if (!userRow) {
          return NextResponse.json(
            { error: 'تعذّر إنشاء الحساب، حاول مجدداً بعد لحظات' },
            { status: 500 }
          )
        }
      }
    } else {
      return NextResponse.json({ error: 'طلب غير صحيح' }, { status: 400 })
    }

    // حارس إضافي: لو لأي سبب لم نحصل على صفّ مستخدم صالح، نتوقّف هنا
    // بدل أن نمرّر قيمة فارغة لباقي الكود (هذا أيضاً يُرضي TypeScript)
    if (!userRow) {
      return NextResponse.json(
        { error: 'تعذّر تسجيل الدخول، حاول مجدداً بعد لحظات' },
        { status: 500 }
      )
    }

    // ============================================================
    // بناء جلسة Supabase حقيقية بصمت (بدون أي بريد أو كلمة مرور تظهر
    // للمستخدم) — عبر رابط سحري يُنشأ ويُستهلَك فوراً على الخادم فقط
    // ============================================================
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: userRow.auth_email,
    })

    const hashedToken = (linkData as any)?.properties?.hashed_token
    if (linkErr || !hashedToken) {
      return NextResponse.json(
        { error: 'تعذّر تسجيل الدخول، حاول مجدداً بعد لحظات' },
        { status: 500 }
      )
    }

    const { data: verified, error: verifyErr } = await anon.auth.verifyOtp({
      email: userRow.auth_email,
      token_hash: hashedToken,
      type: 'magiclink',
    })

    if (verifyErr || !verified.session) {
      return NextResponse.json(
        { error: 'تعذّر تسجيل الدخول، حاول مجدداً بعد لحظات' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      access_token: verified.session.access_token,
      refresh_token: verified.session.refresh_token,
    })
  } catch (e) {
    return NextResponse.json({ error: 'حدث خطأ غير متوقع، حاول مجدداً' }, { status: 500 })
  }
}

// ------------------------------------------------------------
// إنشاء حساب مصادقة حقيقي (بريد داخلي عشوائي لا يظهر لأحد) + صفّ
// المستخدم في جدول users. يُستعمل لأول دخول لأيّ اسم جديد.
// ------------------------------------------------------------
async function createSilentAccount(opts: {
  name: string
  role: 'teacher' | 'student'
  classId?: string
  pinHash?: string
}): Promise<{ id: string; auth_email: string } | null> {
  const email = `${opts.role === 'teacher' ? 't' : 's'}_${randomUUID()}@arabiyati.internal`

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name: opts.name, role: opts.role },
  })
  if (createErr || !created.user) return null

  const { error: insertErr } = await admin.from('users').insert({
    id: created.user.id,
    name: opts.name,
    role: opts.role,
    class_id: opts.classId ?? null,
    pin_hash: opts.pinHash ?? null,
    auth_email: email,
  })

  if (insertErr) {
    // تراجع كامل: لا يجوز ترك حساب مصادقة بلا صفّ مستخدم مطابق
    await admin.auth.admin.deleteUser(created.user.id)
    return null
  }

  return { id: created.user.id, auth_email: email }
}