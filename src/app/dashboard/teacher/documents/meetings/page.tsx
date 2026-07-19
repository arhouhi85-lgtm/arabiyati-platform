'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

export default function Page() {
  const store = useDocStore('meetings')
  return (
    <DocShell title="جدول اللقاءات التربوية" subtitle="الموسم الدراسي 2026/2027">
      <BlankTable store={store} prefix="r" headers={["الرقم","تاريخ اللقاء","ساعة اللقاء","مكان اللقاء","نبذة حول اللقاء"]} widths={["7%","15%","13%","20%","45%"]} rows={15} numbered rowH="42px" />
    </DocShell>
  )
}
