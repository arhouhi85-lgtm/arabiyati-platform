'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

export default function Page() {
  const store = useDocStore('references')
  return (
    <DocShell title="عناوين المراجع المعتمدة" subtitle="الموسم الدراسي 2026/2027">
      <BlankTable store={store} prefix="r" headers={["المادة","اسم المرجع","الطبعة"]} widths={["27%","49%","24%"]} rows={10} rowH="52px" />
    </DocShell>
  )
}
