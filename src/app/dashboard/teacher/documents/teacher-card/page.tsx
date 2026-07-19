'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

export default function Page() {
  const store = useDocStore('teacher_card')
  return (
    <DocShell title="بطاقة الأستاذ(ة)" subtitle="الموسم الدراسي 2026/2027">
      <SectionBar text="معلومات خاصة بالأستاذ(ة)" />
      <PairTable store={store} prefix="p" pairs={[["الاسم الشخصي","الاسم العائلي"],["تاريخ الازدياد","مكان الازدياد"],["رقم البطاقة الوطنية","رقم الهاتف"],["الحالة العائلية","عدد الأبناء"]]} />
      <SectionBar text="المعلومات الإدارية للأستاذ(ة)" />
      <PairTable store={store} prefix="a" pairs={[["رقم التأجير","الإطار"],["تاريخ التوظيف","تاريخ الترسيم"],["الدرجة","تاريخ الدرجة"],["الرتبة","تاريخ الرتبة"]]} />
      <SectionBar text="المعلومات المهنية للأستاذ(ة)" />
      <PairTable store={store} prefix="m" pairs={[["المؤسسة الحالية","تاريخ الالتحاق بالمؤسسة"],["تاريخ التعيين بالأكاديمية","تاريخ التعيين بالمديرية"],["نقطة آخر تفتيش","تاريخها"],["المستوى المسنَد","مجموع عدد التلاميذ"],["مركز التكوين","تاريخ التخرج"],["لغة التكوين","لغة التدريس"]]} />
      <SectionBar text="الشواهد الجامعية المحصَّل عليها" />
      <BlankTable store={store} prefix="c" headers={["اسم الشهادة","التخصص","المؤسسة / الجامعة","تاريخ الحصول عليها"]} widths={["28%","24%","28%","20%"]} rows={4} rowH="36px" />
    </DocShell>
  )
}
