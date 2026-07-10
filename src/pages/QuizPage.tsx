import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getTodayQuiz,
  submitAnswer,
  getLeaderboard,
  type TodayQuizResponse,
} from "../api";

import confetti from "canvas-confetti";


import { useAuth } from "../AuthContext";


// 1. Dynamic Initials Helper (Matches Leaderboard)
const getInitials = (email: string): string => {
  if (!email) return "??";
  const localPart = email.split("@")[0];

  const parts = localPart.split(/[\._-]/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  if (localPart.toLowerCase().startsWith("feliciausosen")) {
    return "FU";
  }

  return localPart.substring(0, 2).toUpperCase();
};

// 2. Dynamic Display Name Helper (Matches Leaderboard)
const getDisplayName = (email: string): string => {
  if (!email) return "User";
  const localPart = email.split("@")[0];

  if (localPart.toLowerCase().startsWith("feliciausosen")) {
    return "Felicia U.";
  }

  const parts = localPart.split(/[\._-]/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1].charAt(0).toUpperCase()}.`;
  }

  return localPart.charAt(0).toUpperCase() + localPart.slice(1, 8);
};

function QuizPage() {
  const { token, logout, email } = useAuth();
  const navigate = useNavigate();

  const [userRank, setUserRank] = useState<number | null>(null);

  const [quizData, setQuizData] = useState<TodayQuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [freezesAvailable, setFreezesAvailable] = useState<number>(0);
  const [freezeUsed, setFreezeUsed] = useState<boolean>(false);

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
    const fetchData = async () => {
      if (!token) return;
      try {
        const [quiz, leaderboard] = await Promise.all([
          getTodayQuiz(token),
          getLeaderboard(token),
        ]);
        setQuizData(quiz);
        setFreezesAvailable(quiz.freezeAvailable ?? 1);

        // Find current user's rank from leaderboard
        const userEntry = leaderboard.find((entry) => entry.email === email);
        setUserRank(userEntry?.rank ?? null);
      } catch (err) {
        setError("Failed to load today's question.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleOptionSelect = async (selectedOption: string) => {
    if (!token || submitting) return;

    setError("");
    setSubmitting(true);

    try {
      const data = await submitAnswer(token, selectedOption);
      setResult(data);
      setFreezeUsed(data.freezeUsed);

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
      : `MathsStreak got me today 😅 Think you can answer today's maths question? Try it:\nhttps://maths-streak-client.vercel.app`;
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
      className="min-h-screen w-full flex justify-center items-start lg:items-center py-6 md:py-12"
      style={{ backgroundColor: "#F7F7FF" }}
    >
      {/* Container max-w-md holds layout aligned cleanly with the main card width size */}
      <div className="w-full max-w-md px-4 flex flex-col relative min-h-[85vh] lg:min-h-175">
        {/* ROW 1: Responsive Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Logo */}
          <div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: "#1A1A2E" }}
            >
              Maths<span style={{ color: "#FF6B35" }}>Streak</span>
            </h1>
            {/* Date badge */}
            <div className="mt-2">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Profile Widget Box */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 w-full sm:w-auto max-w-xs">
            <div className="relative">
              {/* Dynamic Initials Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black select-none shadow-sm"
                style={{ backgroundColor: "#1A1A2E", color: "#FFFFFF" }}
              >
                {getInitials(email ?? "")}
              </div>
              {/* Badge Overlapping Avatar */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black shadow-sm"
                style={{ backgroundColor: "#FF6B35", color: "#FFFFFF" }}
              >
                {userRank === 1 ? "👑" : (userRank ?? "?")}
              </div>
            </div>

            {/* Dynamic Profile Info */}
            <div className="flex flex-col">
              {/* FIXED: Now correctly rendering getDisplayName logic instead of raw initials */}
              <span
                className="text-sm font-bold truncate max-w-35"
                style={{ color: "#1A1A2E" }}
              >
                {getDisplayName(email ?? "")}
              </span>
              <button
                onClick={() => navigate("/leaderboard")}
                className="text-[10px] font-extrabold mt-0.5 tracking-wider uppercase text-left transition hover:opacity-80"
                style={{ color: "#FF6B35" }}
              >
                view LEADERBOARD
              </button>
              <span
                className="text-[10px] font-bold mt-0.5"
                style={{ color: "#06D6A0" }}
              >
                🧊 {freezesAvailable} freeze{freezesAvailable !== 1 ? "s" : ""}{" "}
                left
              </span>
            </div>
          </div>
        </div>

        {/* ROW 2: Main Quiz Content Card */}
        <div className="flex-1 flex items-center justify-center w-full my-4">
          <div className="w-full">
            <div
              className={`bg-white rounded-2xl shadow-lg overflow-hidden w-full ${shake ? "shake" : ""}`}
            >
              <div
                className="h-2 w-full"
                style={{ backgroundColor: "#FF6B35" }}
              />
              <div className="p-6 sm:p-8">
                {error && (
                  <div
                    className="mb-4 p-3 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: "#FEE2E2", color: "#EF233C" }}
                  >
                    {error}
                  </div>
                )}

                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
                  Today's Question
                </p>
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
                          color: displayResult.isCorrect
                            ? "#06D6A0"
                            : "#EF233C",
                        }}
                      >
                        {displayResult.isCorrect
                          ? "Correct! 🎉"
                          : "Not quite 😅"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Answer:{" "}
                        <span className="font-bold text-gray-700">
                          {displayResult.correctAnswer}
                        </span>
                      </p>
                    </div>

                    {/* Integrated Streak History Widget */}
                    <div
                      className="rounded-xl p-4 text-center mb-6"
                      style={{ backgroundColor: "#1A1A2E" }}
                    >
                      <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">
                        Streak History
                      </p>
                      <p
                        className="text-3xl font-black"
                        style={{ color: "#FFE66D" }}
                      >
                        🔥 {displayResult.streak} Days
                      </p>
                      <div className="mt-2">
                        <Link
                          to="/streak"
                          className="text-[11px] font-bold text-white opacity-60 hover:opacity-100  transition"
                        >
                          Open streak history details →
                        </Link>
                        {(freezeUsed || quizData?.freezeUsed) && (
                          <p
                            className="text-[10px] font-bold mt-1"
                            style={{ color: "#06D6A0" }}
                          >
                            🧊 Freeze used to protect your streak!
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Secondary CTA Action Button */}
                    <button
                      onClick={() =>
                        alert("Redirecting to more practice challenges...")
                      }
                      className="w-full py-3.5 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-[0.99]"
                      style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}
                    >
                      Try more math problems
                    </button>

                    <p className="text-center text-[10px] text-gray-300 mt-4 font-medium">
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

        {/* ROW 3: Desktop Utility Alignment Row */}
        <div className="w-full flex justify-end items-center gap-4 mt-6 pb-2 px-1 text-xs font-semibold text-gray-400 sm:absolute sm:bottom-0 sm:right-4 lg:right-0">
          <button
            onClick={handleShare}
            className="hover:text-gray-600 transition-colors"
          >
            {copied ? "Copied! ✓" : "Share"}
          </button>
          <span className="text-gray-200 select-none">|</span>
          <button
            onClick={handleLogout}
            className="hover:text-gray-600 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;