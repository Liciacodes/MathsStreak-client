import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTodayQuiz, submitAnswer, type TodayQuizResponse } from "../api";
import { useAuth } from "../AuthContext";
import confetti from "canvas-confetti";

function QuizPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState<TodayQuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleOptionSelect = async (selectedOption: string) => {
    if (!token || submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const data = await submitAnswer(token, selectedOption);
      setResult(data);

      if (data.isCorrect) {
        triggerConfetti();
      } else {
        triggerHaptic();
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ?? "Failed to submit. Please try again.",
      );
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const showResult = result || quizData?.alreadyAnswered;
  const displayResult = result || {
    isCorrect: quizData?.isCorrect ?? false,
    correctAnswer: quizData?.correctAnswer ?? "",
    streak: quizData?.streak ?? 0,
  };

  const handleShare = async () => {
const text = displayResult.isCorrect
  ? `I'm on a ${displayResult.streak} day streak on MathsStreak! 🔥 Think you can keep up? Try today's question:\nhttps://maths-streak-client.vercel.app`
  : `MathsStreak got me today 😅 Think you can answer today's maths question? Try it:\nhttps://maths-streak-client.vercel.app`;;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F7F7FF" }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <p className="text-gray-400 text-sm">Loading today's question...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F7F7FF" }}
    >
      <div className="w-full max-w-md px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: "#1A1A2E" }}
          >
            Maths<span style={{ color: "#FF6B35" }}>Streak</span>
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
        <div
          className={`bg-white rounded-2xl shadow-lg overflow-hidden ${shake ? "shake" : ""}`}
        >
          <div className="h-2 w-full" style={{ backgroundColor: "#FF6B35" }} />
          <div className="p-6 sm:p-8">
            {" "}
            {/* smaller padding on mobile */}
            {error && (
              <div
                className="mb-4 p-3 rounded-lg text-sm font-medium"
                style={{ backgroundColor: "#FEE2E2", color: "#EF233C" }}
              >
                {error}
              </div>
            )}
            {/* Question label */}
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
              Today's Question
            </p>
            {/* Question text */}
            <p
              className="text-lg font-semibold leading-relaxed mb-8"
              style={{ color: "#1A1A2E" }}
            >
              {quizData?.question}
            </p>
            {showResult ? (
              <div>
                {/* Result banner */}
                <div
                  className="rounded-xl p-4 mb-6 text-center"
                  style={{
                    backgroundColor: displayResult.isCorrect
                      ? "#D1FAE5"
                      : "#FEE2E2",
                  }}
                >
                  <p
                    className="text-2xl font-black mb-1"
                    style={{
                      color: displayResult.isCorrect ? "#06D6A0" : "#EF233C",
                    }}
                  >
                    {displayResult.isCorrect ? "Correct! 🎉" : "Not quite 😅"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Answer:{" "}
                    <span className="font-bold text-gray-700">
                      {displayResult.correctAnswer}
                    </span>
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
                  <p
                    className="text-4xl sm:text-5xl font-black"
                    style={{ color: "#FFE66D" }}
                  >
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

                <div className="mt-6 text-center">
                  <Link
                    to="/streak"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline transition"
                  >
                    View my quiz history history →
                  </Link>
                </div>
                <button
                  onClick={handleShare}
                  className="w-full py-3 rounded-xl font-bold transition-all mt-4"
                  style={{
                    backgroundColor: copied ? "#06D6A0" : "#FFE66D",
                    color: "#1A1A2E",
                  }}
                >
                  {copied ? "Copied! ✓" : "Try it yourself 👀"}
                </button>

                <p className="text-center text-xs text-gray-300 mt-4">
                  New question tomorrow ✦
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizData?.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    disabled={submitting}
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 text-left font-medium text-base transition-all hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50"
                    style={{ color: "#1A1A2E" }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
