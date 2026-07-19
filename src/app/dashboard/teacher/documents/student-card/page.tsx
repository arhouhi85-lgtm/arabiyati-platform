'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

export default function Page() {
  const store = useDocStore('student_card')
  const hrow = (label: string) => (
    <tr key={label} style={{height:'34px'}}>
      <td style={lbl}>{label}</td>
      <td style={td}><Field store={store} id={'h-'+label} align="right" /></td>
    </tr>
  )
  return (
    <DocShell title="بطاقة المتعلم(ة)" subtitle="الموسم الدراسي 2026/2027" noInfo>
      <div style={{display:'flex',gap:'12px',alignItems:'stretch'}}>
        <table style={{flex:1,borderCollapse:'collapse'}}>
          <tbody>
            {hrow('الأكاديمية')}
            {hrow('المديرية الإقليمية')}
            {hrow('المؤسسة التعليمية')}
            {hrow('الوحدة المدرسية')}
            {hrow('المستوى')}
            {hrow('الرقم الترتيبي')}
            <tr style={{height:'34px'}}>
              <td style={lbl}>الموسم الدراسي</td>
              <td style={{...td,fontWeight:'bold',textAlign:'center'}}>2026/2027</td>
            </tr>
          </tbody>
        </table>
        <div style={{width:'150px',border:'1px solid #94a3b8',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',color:'#9ca3af',fontSize:'14px'}}>الصورة</div>
      </div>
      <SectionBar text="معلومات عن المتعلم(ة)" />
      <PairTable store={store} prefix="s" pairs={[["الاسم الكامل للمتعلم(ة)","رقم التسجيل"],["تاريخ الولادة","مكان الولادة"]]} />
      <table style={{width:'100%',borderCollapse:'collapse'}}><tbody><tr style={{height:'38px'}}>
        <td style={{...lbl,width:'19%'}}>العنوان الشخصي</td>
        <td style={td}><Field store={store} id="address" align="right" /></td>
      </tr></tbody></table>
      <SectionBar text="سنوات الدراسة" />
      <p style={{fontSize:'14px',margin:'6px 0 10px 0'}}>
        - التعليم الأولي: <InlineField store={store} id="awali" w="90px" /> — عدد السنوات بالتعليم الأولي: <InlineField store={store} id="awali-n" w="90px" />
      </p>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <tbody>
          <tr>{["المستوى الأول","المستوى الثاني","المستوى الثالث","المستوى الرابع","المستوى الخامس","المستوى السادس"].map(m=>(<th key={m} style={{...th,fontSize:'11px'}}>{m}</th>))}</tr>
          <tr style={{height:'34px'}}>{[0,1,2,3,4,5].map(i=>(<td key={i} style={td}><Field store={store} id={'y-'+i} /></td>))}</tr>
        </tbody>
      </table>
      <SectionBar text="معلومات عن أسرة المتعلم(ة)" />
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <tbody>
          {[["اسم الأب","مهنته","تعليمه"],["اسم الأم","مهنتها","تعليمها"],["عدد الإخوة والأخوات","رقم هاتف الأب","رقم هاتف الأم"]].map((r,i)=>(
            <tr key={i} style={{height:'38px'}}>
              {r.map(c=>([
                <td key={c+'-l'} style={{...lbl,fontSize:'12px'}}>{c}</td>,
                <td key={c+'-v'} style={td}><Field store={store} id={'f-'+c} /></td>
              ]))}
            </tr>
          ))}
        </tbody>
      </table>
    </DocShell>
  )
}
