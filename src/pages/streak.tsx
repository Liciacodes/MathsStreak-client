import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getStreakHistory} from "../api";

export const StreakHistory = () => {
  const { token} = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const data = await getStreakHistory(token);
        setHistory(data);
      } catch (err: any) {
        setError(err.response?.data?.error ?? "Failed to load history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

 

  // Build a map of date string → isCorrect for quick lookup
  const historyMap = new Map(
    history.map((item) => [
      new Date(item.date).toISOString().split("T")[0],
      item.isCorrect,
    ])
  );

  // Generate last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  const totalCorrect = history.filter((h) => h.isCorrect).length;
  const totalAnswered = history.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F7FF" }}>
        <div className="flex flex-col items-center">
          {/* Animated Spinner Circle */}
          <div 
            className="w-10 h-10 border-4 border-t-transparent animate-spin rounded-full mb-4" 
            style={{ borderColor: "#FF6B35", borderTopColor: "transparent" }}
          />
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            Loading your history...
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
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "#1A1A2E" }}>
            Maths<span style={{ color: "#FF6B35" }}>Streak</span>
          </h1>
          
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-black" style={{ color: "#FF6B35" }}>{totalAnswered}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">Days played</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-black" style={{ color: "#06D6A0" }}>{totalCorrect}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">Correct answers</p>
          </div>
        </div>

        {/* Calendar card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-2 w-full" style={{ backgroundColor: "#FF6B35" }} />
          <div className="p-6">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
              Last 30 Days
            </p>

            {error && (
              <p className="text-sm mb-4" style={{ color: "#EF233C" }}>{error}</p>
            )}

            <div className="grid grid-cols-7 gap-2">
              {last30Days.map((dateStr) => {
                const status = historyMap.get(dateStr);
                const isToday = dateStr === new Date().toISOString().split("T")[0];

                return (
                  <div
                    key={dateStr}
                    title={dateStr}
                    className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor:
                        status === true
                          ? "#D1FAE5"
                          : status === false
                          ? "#FEE2E2"
                          : isToday
                          ? "#FFF9C4"
                          : "#F3F4F6",
                      color:
                        status === true
                          ? "#06D6A0"
                          : status === false
                          ? "#EF233C"
                          : "#9CA3AF",
                    }}
                  >
                    {status === true ? "✓" : status === false ? "✗" : isToday ? "·" : ""}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#D1FAE5" }} />
                <span className="text-xs text-gray-400">Correct</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#FEE2E2" }} />
                <span className="text-xs text-gray-400">Wrong</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#F3F4F6" }} />
                <span className="text-xs text-gray-400">Missed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/quiz")}
          className="w-full py-3 rounded-xl font-bold mt-6 transition-all"
          style={{ backgroundColor: "#1A1A2E", color: "#FFE66D" }}
        >
          Back to today's question
        </button>
      </div>
    </div>
  );
};