'use client'
import DocShell, { useDocStore, Field, AreaField, InlineField, BlankTable, PairTable, SectionBar, th, td, lbl, NAVY, GOLD, LIGHT } from '../DocShell'

const VERSES: string[][] = [["منبتَ الأحرارِ", "مشرقَ الأنوارِ"], ["منتدى السؤددِ وحماه", "دمتَ منتداه وحماه"], ["عشتَ في الأوطانِ", "للعلى عنوان"], ["ملءَ كلِّ جَنانِ", "ذكرى كلِّ لسانِ"], ["بالروحِ بالجسدِ", "هبَّ فتاكْ لبّى نداكْ"], ["في فمي وفي دمي", "هواكَ ثارَ نورٌ ونارْ"], ["إخوتي هيا للعلى سعيا", "نشهدِ الدنيا أنّا هنا نحيا"]]
export default function Page() {
  useDocStore('anthem')
  return (
    <DocShell title="النشيد الوطني" subtitle="المملكة المغربية" noInfo noSignatures>
      <div style={{padding:'20px 10px'}}>
        {VERSES.map((v, i) => (
          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'13px 30px'}}>
            <span style={{fontSize:'19px',fontWeight:'bold'}}>{v[0]}</span>
            <span style={{fontSize:'19px',fontWeight:'bold'}}>{v[1]}</span>
          </div>
        ))}
        <p style={{textAlign:'center',fontSize:'19px',fontWeight:'bold',margin:'26px 0 10px 0'}}>بشعار</p>
        <p style={{textAlign:'center',fontSize:'24px',fontWeight:'bold',color:'#166534',margin:0}}>الله &nbsp; الوطن &nbsp; الملك</p>
      </div>
    </DocShell>
  )
}
