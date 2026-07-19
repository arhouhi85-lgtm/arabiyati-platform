'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

export default function Page() {
  const store = useDocStore('leaves')
  return (
    <DocShell title="جدول الرخص" subtitle="الموسم الدراسي 2026/2027">
      <BlankTable store={store} prefix="r" headers={["ر.ت","نوع الرخصة","مدتها","من","إلى"]} widths={["7%","42%","17%","17%","17%"]} rows={20} numbered rowH="32px" />
    </DocShell>
  )
}
