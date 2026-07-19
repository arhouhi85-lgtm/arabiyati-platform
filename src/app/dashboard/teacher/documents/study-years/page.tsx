'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

export default function Page() {
  const store = useDocStore('study_years')
  return (
    <DocShell title="جدول سنوات الدراسة" subtitle="الموسم الدراسي 2026/2027">
      <BlankTable store={store} prefix="r"
        headers={["الرقم","اسم المتعلم(ة)","رقم التسجيل","تاريخ الولادة","1","2","3","4","5","6","ملاحظات"]}
        widths={["4%","24%","12%","12%","4%","4%","4%","4%","4%","4%","24%"]}
        rows={36} numbered rowH="24px" hSize="11px" />
    </DocShell>
  )
}
