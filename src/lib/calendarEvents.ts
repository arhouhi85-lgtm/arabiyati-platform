// مفكرة الموسم الدراسي 2026/2027 — بيانات مشتركة بين لوحتي الأستاذ والتلميذ
// المصدر: المقرر الوزاري المنظم للسنة الدراسية + الأيام الوطنية والعالمية الرسمية

export type CalendarEvent = {
  date: Date
  endDate?: Date
  title: string
  type: 'holiday' | 'exam' | 'day'
  icon: string
  approx?: boolean
}

const TYPE_LABELS: { [k: string]: string } = { holiday: 'عطلة', exam: 'محطة امتحانية', day: 'مناسبة' }
const TYPE_COLORS: { [k: string]: { bg: string; color: string; border: string } } = {
  holiday: { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  exam: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  day: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
}
export { TYPE_LABELS, TYPE_COLORS }

// nth occurrence of a weekday (0=Sunday..6=Saturday) in a given month
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1)
  const shift = (weekday - first.getDay() + 7) % 7
  return new Date(year, month, 1 + shift + (n - 1) * 7)
}
function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0)
  const shift = (last.getDay() - weekday + 7) % 7
  return new Date(year, month + 1, 0 - shift)
}

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day)

export function getSchoolYearEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [
    // ================= العطل المدرسية =================
    { date: d(2026,10,18), endDate: d(2026,10,25), title: 'الفترة البينية الأولى', type: 'holiday', icon: '🏖️' },
    { date: d(2026,10,31), title: 'عيد الوحدة', type: 'holiday', icon: '🇲🇦' },
    { date: d(2026,11,6), title: 'ذكرى المسيرة الخضراء', type: 'holiday', icon: '🇲🇦' },
    { date: d(2026,11,18), title: 'عيد الاستقلال', type: 'holiday', icon: '🇲🇦' },
    { date: d(2026,12,6), endDate: d(2026,12,13), title: 'الفترة البينية الثانية', type: 'holiday', icon: '🏖️' },
    { date: d(2027,1,1), title: 'فاتح السنة الميلادية', type: 'holiday', icon: '🎉' },
    { date: d(2027,1,11), title: 'ذكرى تقديم وثيقة الاستقلال', type: 'holiday', icon: '🇲🇦' },
    { date: d(2027,1,14), title: 'فاتح السنة الأمازيغية', type: 'holiday', icon: 'ⵣ' },
    { date: d(2027,1,24), endDate: d(2027,1,31), title: 'عطلة منتصف السنة الدراسية', type: 'holiday', icon: '🏖️' },
    { date: d(2027,3,29), endDate: d(2027,4,1), title: 'عيد الفطر', type: 'holiday', icon: '🌙', approx: true },
    { date: d(2027,3,21), endDate: d(2027,3,28), title: 'الفترة البينية الثالثة', type: 'holiday', icon: '🏖️' },
    { date: d(2027,5,1), title: 'عيد الشغل', type: 'holiday', icon: '🛠️' },
    { date: d(2027,5,9), endDate: d(2027,5,16), title: 'الفترة البينية الرابعة', type: 'holiday', icon: '🏖️' },
    { date: d(2027,6,15), endDate: d(2027,6,17), title: 'عيد الأضحى المبارك', type: 'holiday', icon: '🌙', approx: true },
    { date: d(2027,7,17), title: 'فاتح محرم (رأس السنة الهجرية)', type: 'holiday', icon: '🌙', approx: true },

    // ================= المحطات الامتحانية =================
    { date: d(2027,1,4), endDate: d(2027,1,9), title: 'آخر فروض المراقبة المستمرة — الأسدس الأول', type: 'exam', icon: '✏️' },
    { date: d(2027,1,18), endDate: d(2027,1,19), title: 'الامتحان الموحد المحلي (شهادة الدروس الابتدائية)', type: 'exam', icon: '📝' },
    { date: d(2027,6,14), endDate: d(2027,6,19), title: 'آخر فروض المراقبة المستمرة — الأسدس الثاني', type: 'exam', icon: '✏️' },
    { date: d(2027,6,25), endDate: d(2027,6,26), title: 'الامتحان الموحد الإقليمي (شهادة الدروس الابتدائية)', type: 'exam', icon: '📝' },

    // ================= الأيام الوطنية والعالمية =================
    { date: d(2026,9,8), title: 'اليوم العالمي لمحو الأمية', type: 'day', icon: '📖' },
    { date: nthWeekday(2026,8,3,2), title: 'اليوم الوطني للدخول المدرسي', type: 'day', icon: '🎒' },
    { date: d(2026,9,16), title: 'اليوم العالمي لحماية طبقة الأوزون', type: 'day', icon: '🌍' },
    { date: d(2026,9,21), title: 'اليوم العالمي للسلم', type: 'day', icon: '🕊️' },
    { date: d(2026,10,5), title: 'اليوم العالمي للمدرس', type: 'day', icon: '👨‍🏫' },
    { date: nthWeekday(2026,9,1,1), title: 'اليوم العالمي للسكن', type: 'day', icon: '🏠' },
    { date: d(2026,10,7), title: 'اليوم العالمي للطفل', type: 'day', icon: '🧒' },
    { date: d(2026,10,9), title: 'اليوم العالمي للبريد', type: 'day', icon: '✉️' },
    { date: d(2026,10,14), title: 'اليوم العالمي للبيئة', type: 'day', icon: '🌳' },
    { date: d(2026,10,16), title: 'اليوم العالمي للتغذية', type: 'day', icon: '🍎' },
    { date: d(2026,11,1), endDate: d(2026,11,10), title: 'الحملة الوطنية للتضامن ضد الفقر', type: 'day', icon: '🤝' },
    { date: d(2026,11,14), title: 'اليوم الوطني للشجرة', type: 'day', icon: '🌲' },
    { date: d(2026,11,15), title: 'اليوم الوطني للصحافة والإعلام', type: 'day', icon: '📰' },
    { date: d(2026,11,16), title: 'اليوم العالمي للتسامح', type: 'day', icon: '🤍' },
    { date: lastWeekday(2026,10,6), title: 'اليوم الوطني للتعاون المدرسي', type: 'day', icon: '🏫' },
    { date: d(2026,11,29), title: 'اليوم العالمي للتضامن مع الشعب الفلسطيني', type: 'day', icon: '🇵🇸' },
    { date: d(2026,12,1), title: 'اليوم العالمي للسيدا', type: 'day', icon: '🎗️' },
    { date: d(2026,12,3), title: 'اليوم العالمي للأشخاص المعاقين', type: 'day', icon: '♿' },
    { date: d(2026,12,8), title: 'اليوم العالمي التطوعي لنظافة البيئة', type: 'day', icon: '🧹' },
    { date: d(2026,12,10), title: 'اليوم العالمي لحقوق الإنسان', type: 'day', icon: '⚖️' },
    { date: d(2027,1,6), title: 'اليوم الوطني لمحاربة الرشوة', type: 'day', icon: '🚫' },
    { date: d(2027,3,8), title: 'اليوم العالمي للمرأة', type: 'day', icon: '👩' },
    { date: d(2027,3,21), endDate: d(2027,3,28), title: 'الأسبوع العالمي للغابة', type: 'day', icon: '🌲' },
    { date: d(2027,3,21), title: 'اليوم العالمي للشعر', type: 'day', icon: '✒️' },
    { date: d(2027,3,22), title: 'اليوم العالمي للماء', type: 'day', icon: '💧' },
    { date: d(2027,3,23), title: 'اليوم العالمي للأرصاد الجوية', type: 'day', icon: '☁️' },
    { date: d(2027,3,24), title: 'اليوم العالمي لمحاربة داء السل', type: 'day', icon: '🫁' },
    { date: d(2027,3,27), title: 'اليوم العالمي للمسرح', type: 'day', icon: '🎭' },
    { date: d(2027,4,7), title: 'اليوم العالمي للصحة', type: 'day', icon: '⚕️' },
    { date: d(2027,4,18), title: 'اليوم العالمي للمباني والمواقع التاريخية', type: 'day', icon: '🏛️' },
    { date: d(2027,4,23), title: 'اليوم العالمي للكتاب وحقوق المؤلف', type: 'day', icon: '📚' },
    { date: d(2027,5,3), title: 'اليوم العالمي لحرية الصحافة', type: 'day', icon: '📰' },
    { date: d(2027,5,4), title: 'اليوم العالمي للمرور', type: 'day', icon: '🚦' },
    { date: d(2027,5,8), title: 'اليوم العالمي للهلال الأحمر', type: 'day', icon: '❤️' },
    { date: d(2027,5,15), title: 'اليوم العالمي للأسرة', type: 'day', icon: '👨‍👩‍👧' },
    { date: d(2027,5,21), title: 'اليوم العالمي للتنمية الثقافية', type: 'day', icon: '🎨' },
    { date: d(2027,5,25), title: 'اليوم العالمي لأفريقيا', type: 'day', icon: '🌍' },
    { date: d(2027,5,26), title: 'الاحتفال بعيد الأم', type: 'day', icon: '💐' },
    { date: d(2027,5,31), title: 'اليوم العالمي لمكافحة التدخين', type: 'day', icon: '🚭' },
    { date: d(2027,6,5), title: 'اليوم العالمي للبيئة', type: 'day', icon: '🌍' },
    { date: d(2027,6,16), title: 'اليوم العالمي للطفل الأفريقي', type: 'day', icon: '🧒' },
    { date: d(2027,6,17), title: 'اليوم العالمي لمحاربة التصحر والجفاف', type: 'day', icon: '🏜️' },
    { date: d(2027,6,21), title: 'اليوم العالمي للموسيقى', type: 'day', icon: '🎵' },
    { date: d(2027,6,26), title: 'اليوم العالمي لمكافحة المخدرات', type: 'day', icon: '🚫' },
    { date: d(2027,7,30), title: 'ذكرى عيد العرش المجيد', type: 'day', icon: '👑' },
    { date: d(2027,8,20), title: 'ذكرى ثورة الملك والشعب', type: 'day', icon: '🇲🇦' },
  ]
  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function getUpcomingEvents(from: Date = new Date(), limit?: number): CalendarEvent[] {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const all = getSchoolYearEvents().filter(e => {
    const end = e.endDate || e.date
    return end >= today
  })
  return limit ? all.slice(0, limit) : all
}

export function daysUntil(date: Date, from: Date = new Date()): number {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function fmtDate(date: Date): string {
  const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
  const months = ['يناير','فبراير','مارس','أبريل','ماي','يونيو','يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر']
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function fmtRange(e: CalendarEvent): string {
  if (!e.endDate || e.endDate.getTime() === e.date.getTime()) return fmtDate(e.date)
  return `من ${fmtDate(e.date)} إلى ${fmtDate(e.endDate)}`
}