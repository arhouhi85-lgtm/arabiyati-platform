'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

export default function Page() {
  const store = useDocStore('memos')
  return (
    <DocShell title="مذكرات ومراسلات" subtitle="الموسم الدراسي 2026/2027">
      <BlankTable store={store} prefix="r" headers={["الرقم","رقم المذكرة","تاريخها","مصدرها","موضوع المذكرة"]} widths={["7%","14%","14%","18%","47%"]} rows={20} numbered rowH="32px" />
    </DocShell>
  )
}
