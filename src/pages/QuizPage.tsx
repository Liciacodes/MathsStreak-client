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

function QuizPage() {
  const { token, logout, email } = useAuth();
  const navigate = useNavigate();

  const [userRank, setUserRank] = useState<number | null>(null);

  const [quizData, setQuizData] = useState<TodayQuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [freezesAvailable, setFreezesAvailable] = useState<number>(0);
  const [freezeUsed, setFreezeUsed] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
      <div className="w-full max-w-md px-4 flex flex-col relative min-h-[85vh] lg:min-h-175  ">
        {/* ROW 1: Responsive Header Block with relative helper added */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative">
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

          {/* Profile Widget Box (relative removed so child matches header width instead) */}
          <div className="">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3"
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black select-none shadow-sm"
                  style={{ backgroundColor: "#1A1A2E", color: "#FFFFFF" }}
                >
                  {getInitials(email ?? "")}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black shadow-sm"
                  style={{ backgroundColor: "#FF6B35", color: "#FFFFFF" }}
                >
                  {userRank === 1 ? "👑" : (userRank ?? "?")}
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gray-400 transition-transform duration-200"
                style={{
                  transform: isProfileOpen ? "rotate(-180deg)" : "rotate(0deg)",
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="M19 9l-7 7-7-7"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Overlay panel — floats over content spanning full width */}
            {isProfileOpen && (
              <>
                {/* Backdrop — click outside to close */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />

                {/* Panel positioned absolutely relative to Row 1 header block */}
                <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-full flex flex-col gap-3">
                  {/* Name + freeze */}
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#1A1A2E" }}
                    >
                      {email}
                    </p>
                    <p
                      className="text-[10px] font-bold mt-1"
                      style={{ color: "#06D6A0" }}
                    >
                      🧊 {freezesAvailable} freeze
                      {freezesAvailable !== 1 ? "s" : ""} left
                    </p>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* View Leaderboard */}
                  <button
                    onClick={() => {
                      navigate("/leaderboard");
                      setIsProfileOpen(false);
                    }}
                    className="text-[10px] font-extrabold tracking-wider uppercase text-left transition hover:opacity-80"
                    style={{ color: "#FF6B35" }}
                  >
                    View Leaderboard →
                  </button>

                  {/* Share */}
                  <div className="border-t border-gray-100" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-left text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
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
                    {/* <button
                      onClick={() =>
                        alert("Redirecting to more practice challenges...")
                      }
                      className="w-full py-3.5 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-[0.99]"
                      style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}
                    >
                      Try more math problems
                    </button> */}

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
      </div>
    </div>
  );
}

export default QuizPage;
