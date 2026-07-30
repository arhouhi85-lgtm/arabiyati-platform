"use client";

// ============================================================
//  عربيتي — لائحة القسم اليدوية (تتبّع داخل الفصل)
//  المكان الصحيح لهذا الملف:
//  src/app/dashboard/teacher/roster/page.tsx
//
//  • النطاق: كل أستاذ يرى لائحة فصوله وحده
//  • الحفظ: في المتصفّح فقط (localStorage) — لا تُسجَّل أي
//    معلومة شخصية للتلاميذ في قاعدة البيانات
//  • الربط التلقائي: بمطابقة الاسم مع الحسابات المسجّلة
// ============================================================

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import TeacherNav from "@/components/TeacherNav";
import { useTeacherGuard } from "@/lib/useTeacherGuard";

// عميل Supabase (نفس مفاتيح .env.local) — يُستعمل فقط لقراءة
// فصول الأستاذ والحسابات المسجّلة، لا لكتابة أي بيانات شخصية.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnon);

// ---------- ألوان الهوية البصرية ----------
const BRAND = {
  navy: "#0F3D73",
  gold: "#B08D51",
  cream: "#F9F6EE",
  white: "#FFFFFF",
  text: "#1a2b3c",
  soft: "#6b6459",
  border: "#e3ddd0",
  danger: "#b3261e",
  success: "#2e7d32",
};

// ---------- مسار شعار الوزارة (يظهر في الورقة المطبوعة فقط) ----------
// ⚙️ عدّل هذا السطر ليطابق اسم ملف شعار الوزارة داخل مجلد public/
const MINISTRY_LOGO = "/images/ministry-logo.png";

// ---------- الأنواع ----------
type Student = {
  id: string;
  fullName: string;
  massar: string;
  birthDate: string;
  birthPlace: string;
};
type ClassRow = { id: number; name: string; join_code: string | null };
type RegisteredStudent = { id: string; name: string | null };
type LinksMap = Record<string, string>; // userId -> studentId

// ---------- أداة توحيد الأسماء للمطابقة ----------
function normalizeName(raw: string | null | undefined): string {
  if (!raw) return "";
  let s = String(raw).trim().toLowerCase();
  // إزالة التشكيل العربي والتطويل
  s = s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "");
  // توحيد الحروف العربية المتشابهة
  s = s
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه");
  // إزالة العلامات اللاتينية (accents)
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // إبقاء الحروف والمسافات فقط، وتوحيد المسافات
  s = s.replace(/[^\p{L}\s]/gu, " ").replace(/\s+/g, " ").trim();
  return s;
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return "id_" + Date.now() + "_" + Math.random().toString(36).slice(2);
  }
}

// ---------- الأنماط المشتركة ----------
const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${BRAND.border}`,
  fontSize: 15,
  outline: "none",
  background: BRAND.white,
  color: BRAND.text,
  width: "100%",
  boxSizing: "border-box",
};
const btn = (bg: string): React.CSSProperties => ({
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: bg,
  color: BRAND.white,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
});
const ghostBtn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: `1px solid ${BRAND.border}`,
  background: BRAND.white,
  color: BRAND.navy,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

// ============================================================
export default function RosterPage() {
  const { loading: guardLoading, teacherId } = useTeacherGuard();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const [roster, setRoster] = useState<Student[]>([]);
  const [links, setLinks] = useState<LinksMap>({});
  const [registered, setRegistered] = useState<RegisteredStudent[]>([]);

  // نموذج الإضافة
  const [form, setForm] = useState<Omit<Student, "id">>({
    fullName: "",
    massar: "",
    birthDate: "",
    birthPlace: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // ----- التحميل الأولي: فصول الأستاذ (بعد اجتياز الحارس) -----
  useEffect(() => {
    if (guardLoading || !teacherId) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("classes")
          .select("id, name, join_code")
          .eq("teacher_id", teacherId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        const rows = (data as ClassRow[]) || [];
        setClasses(rows);
        if (rows.length > 0) setSelectedClassId(rows[0].id);
      } catch (e: any) {
        setErrorMsg("تعذّر جلب الفصول: " + (e?.message || "خطأ غير معروف"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ----- عند تغيير الفصل: تحميل اللائحة والروابط من المتصفّح + الحسابات المسجّلة -----
  useEffect(() => {
    if (selectedClassId == null) return;
    // من المتصفّح
    try {
      const r = localStorage.getItem("arabiyati_roster_" + selectedClassId);
      setRoster(r ? (JSON.parse(r) as Student[]) : []);
    } catch {
      setRoster([]);
    }
    try {
      const l = localStorage.getItem("arabiyati_roster_links_" + selectedClassId);
      setLinks(l ? (JSON.parse(l) as LinksMap) : {});
    } catch {
      setLinks({});
    }
    // الحسابات المسجّلة في هذا الفصل (قراءة فقط)
    (async () => {
      const { data } = await supabase
        .from("users")
        .select("id, name")
        .eq("class_id", selectedClassId)
        .eq("role", "student");
      setRegistered((data as RegisteredStudent[]) || []);
    })();
  }, [selectedClassId]);

  // ----- الحفظ التلقائي في المتصفّح -----
  useEffect(() => {
    if (selectedClassId == null) return;
    localStorage.setItem(
      "arabiyati_roster_" + selectedClassId,
      JSON.stringify(roster)
    );
  }, [roster, selectedClassId]);

  useEffect(() => {
    if (selectedClassId == null) return;
    localStorage.setItem(
      "arabiyati_roster_links_" + selectedClassId,
      JSON.stringify(links)
    );
  }, [links, selectedClassId]);

  // ----- الربط التلقائي بمطابقة الاسم -----
  useEffect(() => {
    if (registered.length === 0 || roster.length === 0) return;
    setLinks((prev) => {
      const next: LinksMap = { ...prev };
      const usedStudentIds = new Set(Object.values(next));
      for (const acc of registered) {
        if (next[acc.id]) continue; // مرتبط أصلاً (يدوياً أو تلقائياً)
        const target = roster.find(
          (st) =>
            !usedStudentIds.has(st.id) &&
            normalizeName(st.fullName) === normalizeName(acc.name) &&
            normalizeName(st.fullName) !== ""
        );
        if (target) {
          next[acc.id] = target.id;
          usedStudentIds.add(target.id);
        }
      }
      return next;
    });
  }, [registered, roster]);

  // خريطة معكوسة: studentId -> اسم الحساب المرتبط
  const linkedAccountByStudent = useMemo(() => {
    const map: Record<string, string> = {};
    for (const acc of registered) {
      const sid = links[acc.id];
      if (sid) map[sid] = acc.name || "حساب مسجّل";
    }
    return map;
  }, [links, registered]);

  const linkedStudentIds = useMemo(
    () => new Set(Object.values(links)),
    [links]
  );

  // ---------- عمليات اللائحة ----------
  function resetForm() {
    setForm({ fullName: "", massar: "", birthDate: "", birthPlace: "" });
    setEditingId(null);
  }

  function submitForm() {
    if (!form.fullName.trim()) {
      alert("الرجاء إدخال الاسم الكامل للتلميذ.");
      return;
    }
    if (editingId) {
      setRoster((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...form } : s))
      );
    } else {
      setRoster((prev) => [...prev, { id: newId(), ...form }]);
    }
    resetForm();
  }

  function startEdit(s: Student) {
    setEditingId(s.id);
    setForm({
      fullName: s.fullName,
      massar: s.massar,
      birthDate: s.birthDate,
      birthPlace: s.birthPlace,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeStudent(id: string) {
    if (!confirm("حذف هذا التلميذ من اللائحة؟")) return;
    setRoster((prev) => prev.filter((s) => s.id !== id));
    // فكّ أي ربط يشير إليه
    setLinks((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) if (next[k] === id) delete next[k];
      return next;
    });
  }

  function move(id: string, dir: -1 | 1) {
    setRoster((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  // ---------- الربط اليدوي ----------
  function linkAccount(userId: string, studentId: string) {
    setLinks((prev) => {
      const next = { ...prev };
      // منع ربط نفس التلميذ بحسابين
      for (const k of Object.keys(next)) if (next[k] === studentId) delete next[k];
      if (studentId) next[userId] = studentId;
      else delete next[userId];
      return next;
    });
  }

  // ---------- تصدير / استيراد احتياطي (ملف على جهازك، بلا قاعدة بيانات) ----------
  function exportBackup() {
    const cls = classes.find((c) => c.id === selectedClassId);
    const payload = { class: cls?.name || "", classId: selectedClassId, roster, links };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `لائحة-${cls?.name || "القسم"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data.roster)) throw new Error("ملف غير صالح");
        if (!confirm("سيُستبدل محتوى اللائحة الحالية بمحتوى الملف. متابعة؟"))
          return;
        setRoster(data.roster as Student[]);
        setLinks((data.links as LinksMap) || {});
      } catch {
        alert("تعذّرت قراءة الملف. تأكد أنه ملف تصدير صحيح.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ============================================================
  if (guardLoading || loading) {
    return (
      <>
        <TeacherNav active="roster" />
        <div style={pageWrap}>
          <p style={{ color: BRAND.soft }}>جارٍ التحميل…</p>
        </div>
      </>
    );
  }

  if (errorMsg) {
    return (
      <>
        <TeacherNav active="roster" />
        <div style={pageWrap}>
          <div style={card}>
            <p style={{ color: BRAND.danger, fontWeight: 700 }}>{errorMsg}</p>
          </div>
        </div>
      </>
    );
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <>
      <TeacherNav active="roster" />
      <div style={pageWrap} dir="rtl">
      {/* أنماط الطباعة */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #roster-print, #roster-print * { visibility: visible; }
          #roster-print { position: absolute; inset: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { margin: 1.2cm; }
        }
      `}</style>

      {/* ترويسة الصفحة: العنوان + زر الطباعة */}
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
        className="no-print"
      >
        <div>
          <h1 style={{ color: BRAND.navy, fontSize: 26, margin: 0 }}>
            لائحة القسم
          </h1>
          <p style={{ color: BRAND.soft, margin: "4px 0 0", fontSize: 14 }}>
            إدارة تلاميذ الفصل يدوياً — تُحفظ في متصفّحك فقط.
          </p>
        </div>
        {selectedClassId != null && roster.length > 0 && (
          <button style={btn(BRAND.gold)} onClick={() => window.print()}>
            🖨 طباعة اللائحة
          </button>
        )}
      </div>

      {/* اختيار الفصل */}
      {classes.length === 0 ? (
        <div style={card}>
          <p style={{ color: BRAND.soft }}>
            لا توجد فصول بعد. أنشئ فصلاً من لوحة الأستاذ أولاً.
          </p>
        </div>
      ) : (
        <div style={{ ...card, marginBottom: 18 }} className="no-print">
          <label style={{ fontWeight: 700, color: BRAND.navy, marginLeft: 10 }}>
            الفصل:
          </label>
          <select
            value={selectedClassId ?? ""}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            style={{ ...inputStyle, width: "auto", minWidth: 220, display: "inline-block" }}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedClassId != null && (
        <>
          {/* نموذج الإضافة / التعديل */}
          <div style={{ ...card, marginBottom: 18 }} className="no-print">
            <h3 style={{ color: BRAND.navy, marginTop: 0 }}>
              {editingId ? "تعديل تلميذ" : "إضافة تلميذ جديد"}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              <div>
                <label style={lbl}>الاسم الكامل *</label>
                <input
                  style={inputStyle}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="مثال: محمد العلوي"
                />
              </div>
              <div>
                <label style={lbl}>رقم التسجيل (مسار)</label>
                <input
                  style={inputStyle}
                  value={form.massar}
                  onChange={(e) => setForm({ ...form, massar: e.target.value })}
                  placeholder="مثال: G123456789"
                />
              </div>
              <div>
                <label style={lbl}>تاريخ الازدياد</label>
                <input
                  style={inputStyle}
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  placeholder="مثال: 2015/09/12"
                />
              </div>
              <div>
                <label style={lbl}>مكان الازدياد</label>
                <input
                  style={inputStyle}
                  value={form.birthPlace}
                  onChange={(e) =>
                    setForm({ ...form, birthPlace: e.target.value })
                  }
                  placeholder="مثال: مراكش"
                />
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <button style={btn(BRAND.navy)} onClick={submitForm}>
                {editingId ? "حفظ التعديل" : "＋ إضافة إلى اللائحة"}
              </button>
              {editingId && (
                <button style={ghostBtn} onClick={resetForm}>
                  إلغاء
                </button>
              )}
            </div>
          </div>

          {/* أدوات احتياطية */}
          <div
            style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}
            className="no-print"
          >
            <button style={ghostBtn} onClick={exportBackup}>
              ⬇ تصدير نسخة احتياطية
            </button>
            <label style={{ ...ghostBtn, display: "inline-block" }}>
              ⬆ استيراد
              <input
                type="file"
                accept="application/json"
                onChange={importBackup}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* الجدول القابل للطباعة */}
          <div id="roster-print" style={card}>
            <div
              style={{
                textAlign: "center",
                marginBottom: 14,
                borderBottom: `2px solid ${BRAND.gold}`,
                paddingBottom: 12,
              }}
            >
              <img
                src={MINISTRY_LOGO}
                alt="وزارة التربية الوطنية"
                style={{ height: 64, width: "auto", marginBottom: 8 }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div style={{ color: BRAND.text, fontSize: 13, fontWeight: 600 }}>
                المملكة المغربية — وزارة التربية الوطنية والتعليم الأولي والرياضة
              </div>
              <div
                style={{
                  fontWeight: 800,
                  color: BRAND.navy,
                  fontSize: 20,
                  marginTop: 8,
                }}
              >
                لائحة تلاميذ القسم
              </div>
              <div style={{ color: BRAND.soft, marginTop: 4 }}>
                {selectedClass?.name} — عدد التلاميذ: {roster.length}
              </div>
            </div>

            {roster.length === 0 ? (
              <p style={{ color: BRAND.soft, textAlign: "center", padding: 20 }}>
                اللائحة فارغة. أضف أول تلميذ من النموذج أعلاه.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                  }}
                >
                  <thead>
                    <tr style={{ background: BRAND.cream }}>
                      <th style={th}>ر.ت</th>
                      <th style={th}>الاسم الكامل</th>
                      <th style={th}>رقم التسجيل</th>
                      <th style={th}>تاريخ الازدياد</th>
                      <th style={th}>مكان الازدياد</th>
                      <th style={th}>الحساب الرقمي</th>
                      <th style={{ ...th }} className="no-print">
                        إجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ ...td, textAlign: "center" }}>{i + 1}</td>
                        <td style={{ ...td, fontWeight: 700 }}>{s.fullName}</td>
                        <td style={td}>{s.massar || "—"}</td>
                        <td style={td}>{s.birthDate || "—"}</td>
                        <td style={td}>{s.birthPlace || "—"}</td>
                        <td style={td}>
                          {linkedAccountByStudent[s.id] ? (
                            <span style={{ color: BRAND.success, fontWeight: 700 }}>
                              ✓ {linkedAccountByStudent[s.id]}
                            </span>
                          ) : (
                            <span style={{ color: BRAND.soft }}>غير مرتبط</span>
                          )}
                        </td>
                        <td style={{ ...td }} className="no-print">
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              style={miniBtn}
                              title="تحريك للأعلى"
                              onClick={() => move(s.id, -1)}
                            >
                              ▲
                            </button>
                            <button
                              style={miniBtn}
                              title="تحريك للأسفل"
                              onClick={() => move(s.id, 1)}
                            >
                              ▼
                            </button>
                            <button style={miniBtn} onClick={() => startEdit(s)}>
                              تعديل
                            </button>
                            <button
                              style={{ ...miniBtn, color: BRAND.danger }}
                              onClick={() => removeStudent(s.id)}
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* قسم الربط بالحسابات المسجّلة */}
          <div style={{ ...card, marginTop: 18 }} className="no-print">
            <h3 style={{ color: BRAND.navy, marginTop: 0 }}>
              ربط الحسابات المسجّلة
            </h3>
            <p style={{ color: BRAND.soft, marginTop: 0 }}>
              الحسابات المتطابقة الاسم تُربط تلقائياً. أما المختلفة (بسبب اختلاف
              اللغة أو الكتابة) فاربطها بنقرة واحدة.
            </p>

            {registered.length === 0 ? (
              <p style={{ color: BRAND.soft }}>
                لا يوجد تلاميذ سجّلوا حساباً في هذا الفصل بعد.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {registered.map((acc) => {
                  const linkedStudentId = links[acc.id] || "";
                  return (
                    <div
                      key={acc.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                        padding: "10px 12px",
                        border: `1px solid ${BRAND.border}`,
                        borderRadius: 8,
                        background: linkedStudentId ? "#f2f8f2" : BRAND.white,
                      }}
                    >
                      <span style={{ fontWeight: 700, color: BRAND.navy }}>
                        👤 {acc.name || "حساب بلا اسم"}
                      </span>
                      <span style={{ color: BRAND.soft }}>←</span>
                      <select
                        value={linkedStudentId}
                        onChange={(e) => linkAccount(acc.id, e.target.value)}
                        style={{ ...inputStyle, width: "auto", minWidth: 200 }}
                      >
                        <option value="">— اختر التلميذ في اللائحة —</option>
                        {roster.map((s) => (
                          <option
                            key={s.id}
                            value={s.id}
                            disabled={
                              linkedStudentIds.has(s.id) &&
                              linkedStudentId !== s.id
                            }
                          >
                            {s.fullName}
                            {linkedStudentIds.has(s.id) &&
                            linkedStudentId !== s.id
                              ? " (مرتبط)"
                              : ""}
                          </option>
                        ))}
                      </select>
                      {linkedStudentId && (
                        <span style={{ color: BRAND.success, fontWeight: 700 }}>
                          ✓ مرتبط
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </>
  );
}

// ---------- أنماط إضافية ----------
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: BRAND.cream,
  padding: "28px 20px 60px",
  fontFamily: "system-ui, 'Segoe UI', Tahoma, sans-serif",
  color: BRAND.text,
  direction: "rtl",
};
const card: React.CSSProperties = {
  background: BRAND.white,
  borderRadius: 14,
  padding: 20,
  border: `1px solid ${BRAND.border}`,
  boxShadow: "0 2px 10px rgba(15,61,115,0.05)",
  maxWidth: 1000,
  margin: "0 auto",
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: BRAND.navy,
  marginBottom: 6,
};
const th: React.CSSProperties = {
  padding: "10px 8px",
  textAlign: "right",
  color: BRAND.navy,
  borderBottom: `2px solid ${BRAND.gold}`,
  fontWeight: 800,
  whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  padding: "10px 8px",
  borderBottom: `1px solid ${BRAND.border}`,
};
const miniBtn: React.CSSProperties = {
  padding: "5px 9px",
  borderRadius: 6,
  border: `1px solid ${BRAND.border}`,
  background: BRAND.white,
  color: BRAND.navy,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};