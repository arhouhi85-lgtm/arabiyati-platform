// ============================================================
// customLessons.ts — الدروس المُدخَلة يدوياً من الأستاذ
// المكان: src/lib/customLessons.ts
//
// تُحفظ في متصفّح الأستاذ فقط (localStorage) — بنفس مبدأ
// لائحة القسم: خصوصية كاملة، بلا حاجة لقاعدة بيانات.
// ============================================================

export type CustomPhenomenon = {
  id: string
  title: string
  domain?: string   // المجال (يتغيّر حسب الوحدة)
  observation: string   // نص الملاحظة أو الأمثلة
  rule: string            // القاعدة (الاستنتاج)
  exercises: string[]     // تمارين التطبيق (تصل إلى 3)
}

export type CustomOral = {
  id: string
  title: string
  domain?: string
  paragraphs: string[]   // فقرات النص السماعي
}

export type CustomWriting = {
  id: string
  title: string
  domain?: string
  subjectText: string
  helperLexicon?: string
  connectors?: string[]
}

export type CustomApplication = {
  id: string
  title: string
  domain?: string
  text: string
  shakl?: string[]
  exercisesWeek1?: string[]
  exercisesWeek2?: string[]
}

export type CustomComponentKey = 'reading' | 'sarf' | 'tarakib' | 'imla' | 'oral' | 'writing' | 'applications'

const keyFor = (comp: CustomComponentKey, year: string, unit: string) =>
  `arabiyati_custom_${comp}_${year}-${unit}`

function readList<T>(comp: CustomComponentKey, year: string, unit: string): T[] {
  try {
    const raw = localStorage.getItem(keyFor(comp, year, unit))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeList<T>(comp: CustomComponentKey, year: string, unit: string, list: T[]) {
  try { localStorage.setItem(keyFor(comp, year, unit), JSON.stringify(list)) } catch {}
}

export function getCustomLessons<T extends { id: string }>(
  comp: CustomComponentKey, year: string, unit: string
): T[] {
  return readList<T>(comp, year, unit)
}

export function saveCustomLesson<T extends { id: string }>(
  comp: CustomComponentKey, year: string, unit: string, lesson: T
) {
  const list = readList<T>(comp, year, unit)
  const idx = list.findIndex(l => l.id === lesson.id)
  if (idx >= 0) list[idx] = lesson
  else list.push(lesson)
  writeList(comp, year, unit, list)
}

export function deleteCustomLesson(
  comp: CustomComponentKey, year: string, unit: string, id: string
) {
  const list = readList<{ id: string }>(comp, year, unit).filter(l => l.id !== id)
  writeList(comp, year, unit, list)
}

export function newLessonId(): string {
  try { return crypto.randomUUID() } catch { return 'lesson_' + Date.now() }
}

export type CustomReading = {
  id: string
  title: string
  domain?: string
  kind: 'functional' | 'poetic' | 'serial'
  paragraphs: string[]
}