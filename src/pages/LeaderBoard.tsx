import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getLeaderboard, type LeaderboardItem } from "../api";

// Extracts clean initials for the avatar circle
const getInitials = (email: string): string => {
  if (!email) return "??";

  const localPart = email.split("@")[0]; // Everything before the '@'

  // 1. If the email has a separator like felicia.usosen or felicia_usosen
  const parts = localPart.split(/[\._-]/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // 2. Specific case override for your account testing
  if (localPart.toLowerCase().startsWith("feliciausosen")) {
    return "FU";
  }

  // Default fallback: Take first two letters of the string (e.g. alex -> AL)
  return localPart.substring(0, 2).toUpperCase();
};

// Masks the email to protect user privacy: feliciausosen@gmail.com -> fel***@gmail.com
const maskEmail = (email: string): string => {
  if (!email) return "";
  const [localPart, domain] = email.split("@");

  // Don't break if someone has a super short email username
  if (localPart.length <= 3) {
    return `${localPart}***@${domain}`;
  }

  // Keep the first 3 letters visible and mask the remaining part of the handle
  const visibleChunk = localPart.substring(0, 3);
  return `${visibleChunk}***@${domain}`;
};

export const Leaderboard = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!token) return;
      try {
        const data = await getLeaderboard(token);
        setRankings(data);
      } catch (err: any) {
        setError(err.response?.data?.error ?? "Failed to load leaderboard.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F7F7FF" }}
      >
        <div className="flex flex-col items-center">
          <div
            className="w-10 h-10 border-4 border-t-transparent animate-spin rounded-full mb-4"
            style={{ borderColor: "#FF6B35", borderTopColor: "transparent" }}
          />
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            Loading standings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F7FF" }}>
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
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

        {/* Leaderboard Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-2 w-full" style={{ backgroundColor: "#06D6A0" }} />
          <div className="p-6">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">
              Weekly Standings (Top 10)
            </p>

            {error && (
              <p className="text-sm mb-4" style={{ color: "#EF233C" }}>
                {error}
              </p>
            )}

            {rankings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                No scores recorded this week yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {rankings.map((user) => {
                  const isFirst = user.rank === 1;
                  const isSecond = user.rank === 2;
                  const isThird = user.rank === 3;

                  return (
                    <div
                      key={user.rank}
                      className="flex justify-between items-center p-3 rounded-xl border border-gray-50 transition-all duration-200"
                      style={{
                        backgroundColor: isFirst
                          ? "#FFFDF0"
                          : isSecond
                            ? "#F9FAFB"
                            : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 text-sm font-black text-center"
                          style={{
                            color: isFirst
                              ? "#FFB100"
                              : isSecond
                                ? "#9CA3AF"
                                : isThird
                                  ? "#CD7F32"
                                  : "#9CA3AF",
                          }}
                        >
                          {isFirst ? "👑" : user.rank}
                        </span>

                        {/* Circular Initial Avatar */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black select-none shadow-sm"
                          style={{
                            backgroundColor: isFirst ? "#FFE66D" : "#1A1A2E",
                            color: isFirst ? "#1A1A2E" : "#FFFFFF",
                          }}
                        >
                          {getInitials(user.email)}
                        </div>

                        {/* Clean Masked Email Output */}
                        <span
                          className="text-sm font-medium truncate max-w-45"
                          style={{ color: "#1A1A2E" }}
                        >
                          {maskEmail(user.email)}
                        </span>
                      </div>

                      {/* Points Display */}
                      <div className="flex items-center gap-1">
                        <span
                          className="text-sm font-black"
                          style={{ color: "#1A1A2E" }}
                        >
                          {user.score}
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                          pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("/quiz")}
          className="w-full py-3 rounded-xl font-bold mt-6 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: "#1A1A2E", color: "#FFE66D" }}
        >
          Back to today's question
        </button>
      </div>
     
    </div>
  );
};
