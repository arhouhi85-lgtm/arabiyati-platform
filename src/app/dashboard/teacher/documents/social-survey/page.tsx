'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

export default function Page() {
  const store = useDocStore('social_survey')
  return (
    <DocShell title="البحث الاجتماعي" subtitle="الموسم الدراسي 2026/2027">
      <BlankTable store={store} prefix="r"
        headers={["ر.ت","الاسم الكامل للمتعلم(ة)","اسم الأب","مهنته","اسم الأم","مهنتها","عدد الإخوة"]}
        widths={["5%","26%","16%","13%","16%","13%","11%"]}
        rows={36} numbered rowH="24px" hSize="11px" />
    </DocShell>
  )
}
