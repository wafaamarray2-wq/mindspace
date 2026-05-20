import { useState, useEffect } from "react";
import axios from "axios";
import "./TestPage.css";

const BASE_URL = "https://mind-space-ov3r.onrender.com";

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

/* ─── Result Screen ─── */
function ResultScreen({ result, onRetake }) {
  const score = result?.score ?? result?.totalPoints ?? 0;
  const level = result?.level ?? result?.stressLevel ?? "";

  const getLevelColor = () => {
    if (score <= 30) return "#16a34a";
    if (score <= 60) return "#d97706";
    return "#e02424";
  };

  const getLevelLabel = () => {
    if (score <= 30) return "منخفض";
    if (score <= 60) return "متوسط";
    return "مرتفع";
  };

  return (
    <div className="result-screen">
      <div className="result-icon">🧠</div>
      <h2>نتيجة الاختبار</h2>

      <div className="score-circle" style={{ "--color": getLevelColor() }}>
        <span className="score-num">{score}</span>
        <span className="score-label">نقطة</span>
      </div>

      <div className="level-badge" style={{ background: getLevelColor() }}>
        مستوى التوتر: {level || getLevelLabel()}
      </div>

      <p className="result-advice">
        {score <= 30
          ? "أنت بخير! حافظ على روتينك الصحي."
          : score <= 60
          ? "مستوى توتر متوسط — حاول الاسترخاء وممارسة الرياضة."
          : "مستوى توتر مرتفع — يُنصح بالتحدث مع متخصص."}
      </p>

      <button className="retake-btn" onClick={onRetake}>
        إعادة الاختبار
      </button>
    </div>
  );
}

/* ─── MAIN ─── */
export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [testId, setTestId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  /* ─── Start Test ─── */
  const startTest = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${BASE_URL}/test/stress`,
        {},
        { headers: authHeader() }
      );

      const data = res.data?.data || res.data;
      setTestId(data?._id || data?.testId);
      setQuestions(data?.questions || []);
      setAnswers({});
      setCurrent(0);
      setStarted(true);
    } catch (e) {
      setError("حدث خطأ أثناء تحميل الاختبار. حاول مرة أخرى.");
      console.log(e.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Select Answer ─── */
  const selectAnswer = (questionId, answerId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  /* ─── Submit ─── */
  const submitTest = async () => {
    setLoading(true);
    setError("");
    try {
      const submittedAnswers = Object.values(answers);
      const res = await axios.post(
        `${BASE_URL}/test/${testId}/submit`,
        { submittedAnswers },
        { headers: authHeader() }
      );
      setResult(res.data?.data || res.data);
      setStarted(false);
    } catch (e) {
      setError("حدث خطأ أثناء إرسال الإجابات.");
      console.log(e.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[current];
  const totalQ = questions.length;
  const progress = totalQ > 0 ? ((current + 1) / totalQ) * 100 : 0;
  const allAnswered = questions.every((q) => answers[q._id]);

  /* ─── Welcome Screen ─── */
  if (!started && !result) {
    return (
      <div className="test-container">
        <div className="welcome-card">
          <div className="welcome-icon">🧘</div>
          <h1>اختبار مستوى التوتر</h1>
          <p>
            هذا الاختبار يساعدك على فهم مستوى التوتر لديك من خلال مجموعة من
            الأسئلة البسيطة. سيستغرق بضع دقائق فقط.
          </p>
          <div className="test-info">
            <div className="info-item">
              <span>⏱</span>
              <span>5 دقائق تقريباً</span>
            </div>
            <div className="info-item">
              <span>❓</span>
              <span>أسئلة متعددة الخيارات</span>
            </div>
            <div className="info-item">
              <span>📊</span>
              <span>نتيجة فورية</span>
            </div>
          </div>
          {error && <div className="test-error">{error}</div>}
          <button className="start-btn" onClick={startTest} disabled={loading}>
            {loading ? "جاري التحميل..." : "ابدأ الاختبار"}
          </button>
        </div>
      </div>
    );
  }

  /* ─── Result Screen ─── */
  if (result) {
    return (
      <div className="test-container">
        <ResultScreen result={result} onRetake={() => setResult(null)} />
      </div>
    );
  }

  /* ─── Quiz Screen ─── */
  return (
    <div className="test-container">
      <div className="quiz-card">
        {/* Progress */}
        <div className="quiz-progress-wrap">
          <div className="quiz-progress-text">
            السؤال {current + 1} من {totalQ}
          </div>
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        {currentQ && (
          <div className="question-block">
            <h3 className="question-text">{currentQ.question}</h3>
            <div className="answers-list">
              {currentQ.answers?.map((ans) => (
                <button
                  key={ans._id}
                  className={`answer-option ${
                    answers[currentQ._id] === ans._id ? "selected" : ""
                  }`}
                  onClick={() => selectAnswer(currentQ._id, ans._id)}
                >
                  {ans.answer}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="test-error">{error}</div>}

        {/* Navigation */}
        <div className="quiz-nav">
          <button
            className="nav-btn secondary"
            onClick={() => setCurrent((p) => Math.max(0, p - 1))}
            disabled={current === 0}
          >
            السابق
          </button>

          {current < totalQ - 1 ? (
            <button
              className="nav-btn primary"
              onClick={() => setCurrent((p) => p + 1)}
              disabled={!answers[currentQ?._id]}
            >
              التالي
            </button>
          ) : (
            <button
              className="nav-btn submit"
              onClick={submitTest}
              disabled={!allAnswered || loading}
            >
              {loading ? "جاري الإرسال..." : "إنهاء الاختبار"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}