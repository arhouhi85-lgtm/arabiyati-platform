// ============================================================
//  completionStats.ts — حساب نسبة اكتمال كل وحدة (مكوّن القراءة)
//  المكان: src/lib/completionStats.ts
//
//  ⚠️ هذا الملف مستقل تماماً ولا يعدّل readingTexts.ts إطلاقاً —
//  يكتفي بقراءة عدد النصوص في كل وحدة منه لحساب المقام (total).
//
//  البيانات القديمة (المحفوظة قبل إضافة text_id/lesson_year/
//  lesson_unit في جدول points) لا تُحتسب هنا، بقرار واعٍ: نبدأ
//  التتبّع الدقيق من هذه اللحظة فصاعداً فقط.
// ============================================================
import { readingTexts } from './readingTexts'

export type UnitProgress = {
  year: string
  unit: string
  key: string          // "4-1"
  totalTexts: number    // عدد نصوص هذه الوحدة (من readingTexts)
  completedTexts: number // عدد النصوص التي أنهاها التلميذ (من سجلات points)
  completedIds: string[]
  percent: number       // 0-100، أو -1 إن لم تكن الوحدة مزوَّدة بنصوص بعد
}

export type PointsRow = {
  text_id?: string | null
  lesson_year?: string | null
  lesson_unit?: string | null
  points?: number
  lesson?: string
  created_at?: string
}

/** عدد نصوص القراءة الكلي لوحدة معيّنة (year-unit)، مباشرة من readingTexts. */
export function totalTextsInUnit(year: string, unit: string): number {
  const key = `${year}-${unit}`
  return (readingTexts[key] || []).length
}

/** كل مفاتيح الوحدات المزوَّدة فعلياً بنصوص حالياً (لعرضها فقط، لا أكثر). */
export function availableUnitKeys(): string[] {
  return Object.keys(readingTexts)
}

/**
 * يحسب تقدّم تلميذ في وحدة واحدة، اعتماداً فقط على السجلات التي
 * تحمل text_id (أي المحفوظة بعد تفعيل التتبّع الدقيق).
 */
export function computeUnitProgress(
  year: string,
  unit: string,
  pointsRows: PointsRow[]
): UnitProgress {
  const key = `${year}-${unit}`
  const total = totalTextsInUnit(year, unit)

  const relevant = pointsRows.filter(
    (p) => p.lesson_year === year && p.lesson_unit === unit && !!p.text_id
  )
  const completedIds = Array.from(new Set(relevant.map((p) => p.text_id as string)))

  return {
    year,
    unit,
    key,
    totalTexts: total,
    completedTexts: completedIds.length,
    completedIds,
    percent: total > 0 ? Math.round((completedIds.length / total) * 100) : -1,
  }
}

/**
 * يحسب تقدّم تلميذ عبر كل الوحدات التي تحوي نصوصاً فعلاً
 * (يتجاهل الوحدات غير المزوَّدة بمحتوى بعد، بدل عرضها كصفر مضلِّل).
 */
export function computeAllUnitsProgress(pointsRows: PointsRow[]): UnitProgress[] {
  return availableUnitKeys()
    .map((key) => {
      const [year, unit] = key.split('-')
      return computeUnitProgress(year, unit, pointsRows)
    })
    .filter((p) => p.totalTexts > 0)
}