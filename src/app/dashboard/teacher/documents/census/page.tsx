'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

export default function Page() {
  const store = useDocStore('census')
  const crow = (label: string, k: string) => (
    <tr key={k} style={{height:'44px'}}>
      <td style={lbl}>{label}</td>
      {['b','g','t'].map(c => (<td key={c} style={td}><Field store={store} id={k+'-'+c} bold /></td>))}
    </tr>
  )
  return (
    <DocShell title="إحصاء المتعلمين" subtitle="الموسم الدراسي 2026/2027">
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <tbody>
          <tr><td style={{...lbl,background:'#f1f5f9'}}></td><th style={th}>الأولاد</th><th style={th}>البنات</th><th style={th}>المجموع</th></tr>
          {crow('عدد الجدد','new')}
          {crow('عدد المكررين','rep')}
          {crow('المجموع','tot')}
        </tbody>
      </table>
      <SectionBar text="توزيع المتعلمين حسب العمر" />
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <tbody>
          <tr>
            <th style={th}>العمر</th>
            {[0,1,2,3,4,5].map(i=>(<td key={i} style={{...td,background:'#f1f5f9'}}><Field store={store} id={'age-'+i} bold /></td>))}
          </tr>
          {['الأولاد','البنات','المجموع'].map(r => (
            <tr key={r} style={{height:'42px'}}>
              <td style={lbl}>{r}</td>
              {[0,1,2,3,4,5].map(i=>(<td key={i} style={td}><Field store={store} id={r+'-'+i} /></td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </DocShell>
  )
}
