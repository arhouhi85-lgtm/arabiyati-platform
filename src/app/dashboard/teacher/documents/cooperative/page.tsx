'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

export default function Page() {
  const store = useDocStore('cooperative')
  const box = (label: string, id: string, w?: string) => (
    <div key={id} style={{flex:w?undefined:1,width:w}}>
      <div style={{background:GOLD,border:'1px solid #94a3b8',borderBottom:'none',borderRadius:'8px 8px 0 0',padding:'5px',textAlign:'center',fontWeight:'bold',fontSize:'13px'}}>{label}</div>
      <div style={{border:'1px solid #94a3b8',borderRadius:'0 0 8px 8px',padding:'6px',height:'30px'}}><Field store={store} id={id} bold /></div>
    </div>
  )
  return (
    <DocShell title="تعاونية القسم" subtitle="الموسم الدراسي 2026/2027">
      <p style={{fontSize:'14px',lineHeight:'2.3'}}>
        اجتمع متعلمو ومتعلمات المستوى <InlineField store={store} id="lvl" /> يوم <InlineField store={store} id="day" w="200px" /> على الساعة <InlineField store={store} id="hour" w="110px" />
        قصد تأسيس تعاونية قسمهم تبعاً لما جاء في المذكرة الوزارية رقم 202 بتاريخ 31/10/1975، وأسفر الاجتماع عن انتخاب المكتب المكوَّن من:
      </p>
      <table style={{width:'100%',borderCollapse:'collapse',margin:'10px 0 16px 0'}}>
        <tbody>
          <tr>{['عدد المتعلمين','عدد الإناث منهم','عدد الذكور منهم'].map(t=>(<th key={t} style={th}>{t}</th>))}</tr>
          <tr style={{height:'40px'}}>{['n','f','m'].map(k=>(<td key={k} style={td}><Field store={store} id={'cnt-'+k} bold /></td>))}</tr>
        </tbody>
      </table>
      <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}>{box('الرئيس(ة)','pres','46%')}</div>
      <div style={{display:'flex',gap:'12px',marginBottom:'12px'}}>
        {box('نائب(ة) الرئيس(ة)','vpres')}
        {box('الأمين(ة)','sec')}
        {box('نائب(ة) الأمين(ة)','vsec')}
      </div>
      <div style={{display:'flex',gap:'12px',marginBottom:'6px'}}>
        {box('مستشار(ة) 1','c1')}
        {box('مستشار(ة) 2','c2')}
        {box('مستشار(ة) 3','c3')}
      </div>
      <SectionBar text="أنشطة التعاونية" />
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <tbody>
          <tr>{['أنشطة ثقافية وفنية','أنشطة صحية وبيئية','أنشطة رياضية وترفيهية'].map(t=>(<th key={t} style={th}>{t}</th>))}</tr>
          <tr>{['cult','health','sport'].map(k=>(<td key={k} style={{...td,verticalAlign:'top',height:'170px'}}><AreaField store={store} id={'act-'+k} rows={8} /></td>))}</tr>
        </tbody>
      </table>
    </DocShell>
  )
}
