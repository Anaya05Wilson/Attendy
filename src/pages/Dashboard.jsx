import { useEffect, useState } from "react";
import { loadAppData } from "../utils/storage";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [todayInfo, setTodayInfo] = useState(null);

  useEffect(() => {
    const data = loadAppData();
    const subjects = data.subjects || [];
    const timetable = data.timetable || {};
    const attendance = data.attendance || {};

    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = today.toISOString().split("T")[0];

    const todaySchedule = timetable[dayName] || [];
    const todayRecord = attendance[dateStr];

    const stats = subjects.map((sub) => {
      let total = 0;
      let attended = 0;
      let attendedDL = 0;

      Object.values(attendance || {}).forEach((record) => {
        if (record.type !== "NORMAL") return;

        record.slots.forEach((slot) => {
          if (slot.subject === sub.code) {
            total++;
            if (slot.status === "P") attended++;
            if (slot.status === "P" || slot.status === "DL") attendedDL++;
          }
        });
      });

      return { ...sub, total, attended, attendedDL };
    });

    setSummary(stats);

    setTodayInfo({
      dayName,
      dateStr,
      timetableCount: todaySchedule.filter(
        (x) => x && x !== "BREAK"
      ).length,
      markedCount:
        todayRecord?.slots?.filter((s) => s.status !== "").length || 0,
    });
  }, []);

  const getColor = (percent) => {
    if (percent > 90) return "text-green-400";
    if (percent >= 80) return "text-yellow-400";
    if (percent >= 75) return "text-orange-400";
    return "text-red-400";
  };

  if (!summary || !todayInfo) return <p>Loading…</p>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Today Overview */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <p className="text-lg font-semibold">{todayInfo.dayName}</p>
        <p className="text-sm text-gray-400">{todayInfo.dateStr}</p>
        <p className="mt-2">
          {todayInfo.markedCount}/{todayInfo.timetableCount} periods marked
        </p>
      </div>

      {/* Warning Section */}
      {summary.some((s) => s.total > 0 && (s.attended / s.total) * 100 < 75) && (
        <div className="bg-red-600 p-3 text-white text-sm rounded">
          ⚠ You are below 75% in some subjects. Check Reports!
        </div>
      )}

      {/* Quick Stats */}
      <div className="space-y-3">
        {summary.map((s) => {
          const percent =
            s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0;

          return (
            <div
              key={s.code}
              className="bg-gray-800 p-3 rounded-lg flex justify-between"
            >
              <span>{s.code}</span>
              <span className={getColor(percent)}>{percent}%</span>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <a
          href="/mark"
          className="bg-blue-600 text-center py-2 rounded hover:bg-blue-500"
        >
          Mark Attendance
        </a>
        <a
          href="/reports"
          className="bg-purple-600 text-center py-2 rounded hover:bg-purple-500"
        >
          Reports
        </a>
      </div>
    </div>
  );
}
