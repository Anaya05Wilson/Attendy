import { useEffect, useState } from "react";
import { loadAppData } from "../utils/storage";

export default function Reports() {
  const [summary, setSummary] = useState([]);
  const [includeDL, setIncludeDL] = useState(false);

  useEffect(() => {
    const data = loadAppData();
    const subjects = data.subjects || [];
    const attendance = data.attendance || {};

    // Build summary object for each subject
    const stats = subjects.map((sub) => ({
      code: sub.code,
      name: sub.name,
      attended: 0,     // Present only
      attendedWithDL: 0, // Present + DL
      total: 0
    }));

    // Loop through recorded days
    Object.values(attendance).forEach((day) => {
      // Skip Holidays / No-Class days
      if (!day || day.type !== "NORMAL") return;

      // Loop through hour-wise slots
      day.slots.forEach((slot) => {
        const found = stats.find((s) => s.code === slot.subject);
        if (!found) return;

        found.total++;

        if (slot.status === "P") found.attended++;
        if (slot.status === "P" || slot.status === "DL") found.attendedWithDL++;
      });
    });

    setSummary(stats);
  }, []);

  const getColor = (percent) => {
    if (percent > 90) return "text-green-400";
    if (percent >= 80) return "text-yellow-400";
    if (percent >= 75) return "text-orange-400";
    return "text-red-400";
  };

  const calculateMessage = (attended, total) => {
    if (total === 0) return "No classes yet";

    const percent = (attended / total) * 100;

    if (percent >= 75) {
      // how many can bunk?
      let bunkable = 0;
      let A = attended;
      let T = total;
      while ((A / (T + 1)) * 100 >= 75) {
        bunkable++;
        T++;
      }
      return `✔ You can bunk: ${bunkable}`;
    } else {
      // how many needed to reach 75%
      let needed = 0;
      let A = attended;
      let T = total;
      while ((A + 1) / (T + 1) * 100 < 75) {
        needed++;
        A++;
        T++;
      }
      return `⚠ Need to attend: ${needed}`;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* Toggle: Include DL Mode */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={includeDL}
          onChange={() => setIncludeDL(!includeDL)}
        />
        <span className="text-sm text-gray-300">
          Include Duty Leave in Calculation
        </span>
      </label>

      {/* Subject Cards */}
      {summary.length === 0 ? (
        <p className="text-gray-400">No subjects found. Setup first.</p>
      ) : (
        summary.map((sub) => {
          const attended = includeDL ? sub.attendedWithDL : sub.attended;
          const total = sub.total;
          const percent = total > 0 ? Math.round((attended / total) * 100) : 0;

          return (
            <div
              key={sub.code}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-2"
            >
              <div className="flex justify-between">
                <p className="font-semibold">{sub.code} — {sub.name}</p>
                <p className={`${getColor(percent)} text-lg font-bold`}>
                  {percent}%
                </p>
              </div>

              <p className="text-sm text-gray-300">
                {attended}/{total} classes attended
              </p>

              <p className="text-sm">
                {calculateMessage(attended, total)}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
