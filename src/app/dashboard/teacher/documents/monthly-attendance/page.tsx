'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

const MONTHS = ["شتنبر","أكتوبر","نونبر","دجنبر","يناير","فبراير","مارس","أبريل","ماي","يونيو"]
export default function Page() {
  const store = useDocStore('monthly_attendance')
  return (
    <DocShell title="المواظبة الشهرية" subtitle="الموسم الدراسي 2026/2027">
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <tbody>
          <tr><th style={{...th,fontSize:'11px'}}>الشهر</th>{MONTHS.map(m=>(<th key={m} style={{...th,fontSize:'11px'}}>{m}</th>))}</tr>
          <tr style={{height:'44px'}}><td style={{...lbl,fontSize:'11px'}}>نسبة الحضور %</td>{MONTHS.map(m=>(<td key={m} style={td}><Field store={store} id={'p-'+m} /></td>))}</tr>
          <tr style={{height:'44px'}}><td style={{...lbl,fontSize:'11px'}}>نسبة الغياب %</td>{MONTHS.map(m=>(<td key={m} style={td}><Field store={store} id={'a-'+m} /></td>))}</tr>
        </tbody>
      </table>
      <SectionBar text="ملاحظات وتتبع المواظبة" />
      <BlankTable store={store} prefix="n" headers={["الشهر","أبرز الملاحظات حول مواظبة المتعلمين","الإجراءات المتخذة"]} widths={["14%","52%","34%"]} rows={10} rowH="44px" />
    </DocShell>
  )
}
