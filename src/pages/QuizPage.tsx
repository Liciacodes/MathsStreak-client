import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTodayQuiz, submitAnswer, type TodayQuizResponse } from "../api";
import { useAuth } from "../AuthContext";
import confetti from "canvas-confetti";

function QuizPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState<TodayQuizResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    streak: number;
  } | null>(null);

  const triggerConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#FF6B35", "#FFE66D", "#06D6A0", "#1A1A2E"],
  });
};

const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }
};

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!token) return;
      try {
        const data = await getTodayQuiz(token);
        setQuizData(data);
      } catch (err) {
        setError("Failed to load today's question.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!token) return;

  setError("");
  setSubmitting(true);

  try {
    const data = await submitAnswer(token, answer);
    setResult(data);

    if (data.isCorrect) {
      triggerConfetti();
    } else {
      triggerHaptic();
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  } catch (err) {
    setError("Failed to submit. Please try again.");
    console.error(err);
  } finally {
    setSubmitting(false);
  }
};

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F7FF" }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <p className="text-gray-400 text-sm">Loading today's question...</p>
        </div>
      </div>
    );
  }

  const showResult = result || quizData?.alreadyAnswered;
  const displayResult = result || {
    isCorrect: quizData?.isCorrect ?? false,
    correctAnswer: quizData?.correctAnswer ?? "",
    streak: quizData?.streak ?? 0,
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F7FF" }}>
      <div className="w-full max-w-md px-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
  <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "#1A1A2E" }}>
    Quiz<span style={{ color: "#FF6B35" }}>Streak</span>
  </h1>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Log out
          </button>
        </div>

        {/* Date badge */}
        <div className="mb-4">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Main card */}
        {/* Main card — update padding */}
<div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${shake ? "shake" : ""}`}>
  <div className="h-2 w-full" style={{ backgroundColor: "#FF6B35" }} />
  <div className="p-6 sm:p-8">  {/* smaller padding on mobile */}
            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm font-medium" style={{ backgroundColor: "#FEE2E2", color: "#EF233C" }}>
                {error}
              </div>
            )}

            {/* Question label */}
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
              Today's Question
            </p>

            {/* Question text */}
            <p className="text-lg font-semibold leading-relaxed mb-8" style={{ color: "#1A1A2E" }}>
              {quizData?.question}
            </p>

            {showResult ? (
              <div>
                {/* Result banner */}
                <div
                  className="rounded-xl p-4 mb-6 text-center"
                  style={{
                    backgroundColor: displayResult.isCorrect ? "#D1FAE5" : "#FEE2E2",
                  }}
                >
                  <p
                    className="text-2xl font-black mb-1"
                    style={{ color: displayResult.isCorrect ? "#06D6A0" : "#EF233C" }}
                  >
                    {displayResult.isCorrect ? "Correct! 🎉" : "Not quite 😅"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Answer: <span className="font-bold text-gray-700">{displayResult.correctAnswer}</span>
                  </p>
                </div>

                {/* Streak counter — the signature element */}
                <div
                  className="rounded-xl p-5 text-center"
                  style={{ backgroundColor: "#1A1A2E" }}
                >
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">
                    Current Streak
                  </p>
                  <p className="text-4xl sm:text-5xl font-black" style={{ color: "#FFE66D" }}>
  🔥 {displayResult.streak}
</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {displayResult.streak === 0
                      ? "Answer correctly tomorrow to start a streak!"
                      : displayResult.streak === 1
                      ? "Great start! Come back tomorrow."
                      : `${displayResult.streak} days in a row. Keep it up!`}
                  </p>
                </div>

                <p className="text-center text-xs text-gray-300 mt-4">
                  New question tomorrow ✦
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
  type="text"
  placeholder="Type your answer..."
  value={answer}
  onChange={(e) => setAnswer(e.target.value)}
  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none focus:border-orange-400 transition-colors text-base"
  required
  autoFocus
/>
<button
  type="submit"
  disabled={submitting}
  className="w-full py-4 rounded-xl font-bold text-white transition-opacity disabled:opacity-50 text-base"
  style={{ backgroundColor: "#FF6B35" }}
>
  {submitting ? "Checking..." : "Submit Answer →"}
</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;