'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const NAVY = '#1e3a8a'
export const GOLD = '#fde68a'
export const LIGHT = '#f1f5f9'

// حفظ بيانات كل وثيقة في المتصفح
export function useDocStore(key: string) {
  const full = 'arabiyati_doc_' + key
  const [data, setData] = useState<{[id:string]: string}>({})
  useEffect(() => {
    try { const s = localStorage.getItem(full); if (s) setData(JSON.parse(s)) } catch (e) {}
  }, [full])
  const set = (id: string, v: string) => setData(prev => {
    const next = { ...prev, [id]: v }
    try { localStorage.setItem(full, JSON.stringify(next)) } catch (e) {}
    return next
  })
  const get = (id: string) => data[id] ?? ''
  return { get, set }
}

// خانة كتابة داخل جدول
export const Field = ({ store, id, size, align, bold }: any) => (
  <input value={store.get(id)} onChange={(e: any) => store.set(id, e.target.value)}
    style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', fontFamily: 'Arial',
      fontSize: size || '13px', textAlign: align || 'center', fontWeight: bold ? 'bold' : 'normal',
      color: '#1e293b', boxSizing: 'border-box', padding: 0 }} />
)

// خانة كتابة متعددة الأسطر
export const AreaField = ({ store, id, rows }: any) => (
  <textarea value={store.get(id)} onChange={(e: any) => store.set(id, e.target.value)} rows={rows || 6}
    style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', fontFamily: 'Arial',
      fontSize: '13px', textAlign: 'right', color: '#1e293b', resize: 'none', boxSizing: 'border-box', lineHeight: '1.9' }} />
)

// خانة على سطر منقّط (داخل فقرة)
export const InlineField = ({ store, id, w }: any) => (
  <input value={store.get(id)} onChange={(e: any) => store.set(id, e.target.value)}
    style={{ border: 'none', borderBottom: '1px dotted #94a3b8', outline: 'none', width: w || '170px',
      background: 'transparent', fontFamily: 'Arial', fontSize: '14px', textAlign: 'center',
      fontWeight: 'bold', color: '#1e293b', margin: '0 6px' }} />
)

export const th: any = { background: NAVY, color: 'white', border: '1px solid ' + NAVY, padding: '6px 8px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }
export const td: any = { border: '1px solid #94a3b8', padding: '4px 8px', background: 'white' }
export const lbl: any = { background: GOLD, border: '1px solid #94a3b8', padding: '5px 8px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap' }

export const SectionBar = ({ text, color }: any) => (
  <div style={{ background: color || NAVY, borderRadius: '8px', padding: '7px 14px', margin: '16px 0 8px 0' }}>
    <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 'bold', margin: 0 }}>{text}</h3>
  </div>
)

// جدول: عمود تسمية ذهبي + خانة، مثنى في كل سطر
export const PairTable = ({ store, prefix, pairs, rowH }: any) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <tbody>
      {pairs.map((p: string[], i: number) => (
        <tr key={i} style={{ height: rowH || '38px' }}>
          <td style={{ ...lbl, width: '19%' }}>{p[0]}</td>
          <td style={{ ...td, width: '31%' }}><Field store={store} id={`${prefix}-${p[0]}`} align="right" /></td>
          <td style={{ ...lbl, width: '19%' }}>{p[1]}</td>
          <td style={{ ...td, width: '31%' }}><Field store={store} id={`${prefix}-${p[1]}`} align="right" /></td>
        </tr>
      ))}
    </tbody>
  </table>
)

// جدول بصفوف فارغة قابلة للكتابة
export const BlankTable = ({ store, prefix, headers, widths, rows, numbered, rowH, hSize }: any) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>{headers.map((h: string, i: number) => (
        <th key={i} style={{ ...th, width: widths?.[i], fontSize: hSize || '12px' }}>{h}</th>
      ))}</tr>
    </thead>
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} style={{ height: rowH || '30px', background: r % 2 === 1 ? LIGHT : 'white' }}>
          {headers.map((_: string, c: number) => (
            <td key={c} style={{ border: '1px solid #94a3b8', padding: '2px 6px' }}>
              {numbered && c === 0
                ? <span style={{ display: 'block', textAlign: 'center', fontWeight: 'bold', color: '#6b7280', fontSize: '12px' }}>{r + 1}</span>
                : <Field store={store} id={`${prefix}-${r}-${c}`} size="12px" align={c === headers.length - 1 || headers[c].includes('اسم') || headers[c].includes('موضوع') || headers[c].includes('نبذة') ? 'right' : 'center'} />}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)

// الإطار العام للوثيقة
export default function DocShell({ title, subtitle, noInfo, noSignatures, children }: any) {
  const [teacherName, setTeacherName] = useState('')
  const [info, setInfo] = useState({ taj: '', academy: '', direction: '', school: '', unit: '', level: '', season: '2026/2027' })

  useEffect(() => {
    try { const s = localStorage.getItem('arabiyati_school_info'); if (s) setInfo(prev => ({ ...prev, ...JSON.parse(s) })) } catch (e) {}
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { window.location.href = '/auth/login'; return }
      const { data: me } = await supabase.from('users').select('name').eq('id', session.user.id).single()
      setTeacherName(me?.name || '')
    })
  }, [])

  const updateInfo = (key: string, value: string) => setInfo(prev => {
    const next = { ...prev, [key]: value }
    try { localStorage.setItem('arabiyati_school_info', JSON.stringify(next)) } catch (e) {}
    return next
  })

  const infoInput = (key: keyof typeof info) => (
    <input value={info[key]} onChange={e => updateInfo(key, e.target.value)}
      style={{ border: 'none', outline: 'none', width: '100%', fontSize: '12px', fontFamily: 'Arial', textAlign: 'center', background: 'transparent', fontWeight: 'bold', color: '#1e293b' }} />
  )

  return (
    <main dir="rtl" style={{ minHeight: '100vh', background: '#f0f9ff', fontFamily: 'Arial' }}>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          main { background: white !important; padding: 0 !important; }
          .doc-wrap { max-width: none !important; margin: 0 !important; padding: 0 !important; }
          .print-area { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; padding: 9mm !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      <nav className="no-print" style={{ background: 'white', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '8px' }}>
        <h1 style={{ color: '#7c3aed', fontSize: '19px', fontWeight: 'bold', margin: 0 }}>{title}</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => window.print()}
            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
            🖨️ طباعة
          </button>
          <a href="/dashboard/teacher/documents" style={{ background: '#f5f3ff', color: '#7c3aed', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
            📚 الوثائق
          </a>
        </div>
      </nav>

      <div className="doc-wrap" style={{ maxWidth: '850px', margin: '0 auto', padding: '18px' }}>
        <div className="print-area" style={{ background: 'white', borderRadius: '14px', padding: '22px', boxShadow: '0 3px 14px rgba(0,0,0,0.08)' }}>

          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <img src="/images/ministry-logo.png" alt="وزارة التربية الوطنية والتعليم الأولي والرياضة" style={{ height: '100px', objectFit: 'contain' }} />
          </div>

          <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius: '12px', padding: '11px 18px', textAlign: 'center', marginBottom: '14px' }}>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: subtitle ? '0 0 4px 0' : 0 }}>{title}</h2>
            {subtitle && <p style={{ color: '#bfdbfe', fontSize: '12px', margin: 0 }}>{subtitle}</p>}
          </div>

          {!noInfo && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
              <tbody>
                <tr>
                  {['الأستاذ(ة)', 'رقم التأجير', 'الأكاديمية', 'المديرية الإقليمية', 'المؤسسة', 'المستوى'].map(l => (
                    <td key={l} style={{ ...th, fontSize: '12px' }}>{l}</td>
                  ))}
                </tr>
                <tr style={{ height: '34px' }}>
                  <td style={td}><span style={{ fontWeight: 'bold', fontSize: '12px', display: 'block', textAlign: 'center' }}>{teacherName}</span></td>
                  <td style={td}>{infoInput('taj')}</td>
                  <td style={td}>{infoInput('academy')}</td>
                  <td style={td}>{infoInput('direction')}</td>
                  <td style={td}>{infoInput('school')}</td>
                  <td style={td}>{infoInput('level')}</td>
                </tr>
              </tbody>
            </table>
          )}

          {children}

          {!noSignatures && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '22px', fontSize: '13px', fontWeight: 'bold', color: '#1e293b', flexWrap: 'wrap', gap: '10px' }}>
              <span>الأستاذ(ة):</span>
              <span>السيد(ة) المدير(ة):</span>
              <span>السيد(ة) المفتش(ة) التربوي(ة):</span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
