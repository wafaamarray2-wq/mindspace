import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://mind-space-ov3r.onrender.com";
function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/admin/questions`, { headers: authHeader() })
      .then((r) => r.json())
      .then((d) => setQuestions(d?.data || d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectAnswer = (answerId) => {
    setSelected((prev) => ({ ...prev, [current]: answerId }));
  };

  const showResult = () => {
    let total = 0, maxTotal = 0;
    questions.forEach((q, qi) => {
      const selId = selected[qi];
      if (selId) {
        const ans = q.answers.find((a) => a._id === selId);
        if (ans) total += ans.points || 0;
      }
      maxTotal += Math.max(...q.answers.map((a) => a.points || 0));
    });
    const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
    setResult({ total, pct });
  };

  if (loading) return <div>جاري التحميل...</div>;

  if (result) {
    const { total, pct } = result;
    const level = pct <= 40 ? "منخفض" : pct <= 70 ? "متوسط" : "مرتفع";
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>نتيجتك: {total} نقطة</h2>
        <p>مستوى {level} ({pct}%)</p>
        <button onClick={() => { setCurrent(0); setSelected({}); setResult(null); }}>
          إعادة الاختبار
        </button>
      </div>
    );
  }

  const q = questions[current];
  const pct = Math.round((current / questions.length) * 100);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "2rem", direction: "rtl" }}>
      <h1>اختبار الصحة النفسية</h1>
      <div style={{ height: 6, background: "#eee", borderRadius: 99, margin: "1rem 0" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#3b7d7f", borderRadius: 99, transition: "width .4s" }} />
      </div>
      <p style={{ fontSize: 12, color: "#888" }}>السؤال {current + 1} من {questions.length}</p>
      <span style={{ background: "#e1f5ee", color: "#085041", padding: "3px 10px", borderRadius: 99, fontSize: 11 }}>{q.type}</span>
      <h3 style={{ margin: "1rem 0" }}>{q.question}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.answers.map((a) => (
          <button
            key={a._id}
            onClick={() => selectAnswer(a._id)}
            style={{
              padding: ".75rem 1rem", border: `1.5px solid ${selected[current] === a._id ? "#3b7d7f" : "#ddd"}`,
              borderRadius: 8, background: selected[current] === a._id ? "#e1f5ee" : "#fff",
              cursor: "pointer", textAlign: "right", fontSize: 14,
            }}
          >
            {a.answer}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: "1.5rem" }}>
        <button disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>← السابق</button>
        {current < questions.length - 1
          ? <button onClick={() => setCurrent((c) => c + 1)} style={{ background: "#3b7d7f", color: "#fff", border: "none", padding: ".7rem 1.5rem", borderRadius: 8, cursor: "pointer" }}>التالي →</button>
          : <button onClick={showResult} style={{ background: "#3b7d7f", color: "#fff", border: "none", padding: ".7rem 1.5rem", borderRadius: 8, cursor: "pointer" }}>عرض النتيجة ✓</button>
        }
      </div>
    </div>
  );
}