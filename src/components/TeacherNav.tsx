'use client'
// ============================================================
//  الشريط العلوي المشترك لصفحات الأستاذ
//  المكان الصحيح لهذا الملف:
//  src/components/TeacherNav.tsx
//
//  الاستعمال في أي صفحة أستاذ:
//    import TeacherNav from '@/components/TeacherNav'
//    ...
//    <TeacherNav active="roster" />
//
//  قيمة active تحدّد الزر المميَّز (المكان الحالي). القيم الممكنة:
//  "home" | "agenda" | "community" | "chat" | "documents"
//  | "roster" | "attendance" | "leaderboard"
// ============================================================
import { BRAND } from '@/lib/brand'

type NavKey =
  | 'home'
  | 'agenda'
  | 'community'
  | 'chat'
  | 'documents'
  | 'roster'
  | 'attendance'
  | 'leaderboard'
  | 'projector'
  | 'jadhada'

const LINKS: { key: NavKey; href: string; label: string; bg: string; color: string }[] = [
  { key: 'home',        href: '/dashboard/teacher',              label: '🏠 لوحتي',           bg: '#eef2ff', color: '#4f46e5' },
  { key: 'agenda',      href: '/dashboard/teacher/agenda',       label: '📅 المفكرة',         bg: '#ecfeff', color: '#0891b2' },
  { key: 'community',   href: '/dashboard/teacher/community',    label: '🌐 مجتمع المعرفة',   bg: '#eff6ff', color: '#2563eb' },
  { key: 'chat',        href: '/dashboard/teacher/chat',         label: '💬 رسائل التلاميذ',  bg: '#fefce8', color: '#ca8a04' },
  { key: 'documents',   href: '/dashboard/teacher/documents',    label: '📚 الوثائق التربوية', bg: '#f5f3ff', color: '#7c3aed' },
  { key: 'roster',      href: '/dashboard/teacher/roster',       label: '👥 لائحة القسم',     bg: '#f5efe3', color: '#B08D51' },
  { key: 'attendance',  href: '/dashboard/teacher/attendance',   label: '📋 سجل الغياب',      bg: '#f0fdf4', color: '#16a34a' },
  { key: 'leaderboard', href: '/dashboard/teacher/leaderboard',  label: '🏆 لوحة الصدارة',    bg: '#fef9c3', color: '#ca8a04' },
  { key: 'projector',   href: '/dashboard/teacher/projector',    label: '🖥️ عرض بالمسلاط',    bg: '#eef2ff', color: '#0F3D73' },
  { key: 'jadhada',     href: '/dashboard/teacher/jadhada',      label: '📄 منشئ الجذاذات',   bg: '#f0fdfa', color: '#0f766e' },
]

export default function TeacherNav({ active }: { active?: NavKey }) {
  return (
    <nav
      dir="rtl"
      style={{
        background: 'white',
        padding: '14px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(15,61,115,0.08)',
        flexWrap: 'wrap',
        gap: '10px',
        fontFamily: 'Arial',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <img src="/images/logo-mark.png" alt="عربيتي" style={{ height: '38px', objectFit: 'contain' }} />
        <h1 style={{ color: BRAND.navy, fontSize: '19px', fontWeight: 'bold', margin: 0 }}>لوحة الأستاذ</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {LINKS.map((l) => {
          const isActive = l.key === active
          return (
            <a
              key={l.key}
              href={l.href}
              style={{
                background: isActive ? l.color : l.bg,
                color: isActive ? 'white' : l.color,
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                border: isActive ? `2px solid ${l.color}` : '2px solid transparent',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {l.label}
            </a>
          )
        })}
        <a
          href="/"
          style={{
            background: '#fee2e2',
            color: '#ef4444',
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          خروج
        </a>
      </div>
    </nav>
  )
}