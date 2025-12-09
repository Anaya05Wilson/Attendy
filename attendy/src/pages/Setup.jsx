import { useEffect, useState } from "react";
import { loadAppData, saveAppData } from "../utils/storage";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS_BY_DAY = {
  Monday: 7,
  Tuesday: 7,
  Wednesday: 7,
  Thursday: 7,
  Friday: 7, // full 7 rows, but 5th becomes break
};

const BREAK_SLOT = {
  Friday: 4, // index starts at 0 → H5 = index 4
};


export default function Setup() {
  const [subjects, setSubjects] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [timetable, setTimetable] = useState({});
  const [savedMsg, setSavedMsg] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadAppData();
    setSubjects(data.subjects || []);

    // Build default timetable structure (if not present)
    const tt = {};
    DAYS.forEach((day) => {
      const hours = HOURS_BY_DAY[day];
      const existingRow = (data.timetable && data.timetable[day]) || [];
      tt[day] = Array.from({ length: hours }, (_, i) => existingRow[i] || "");
    });
    setTimetable(tt);
  }, []);

  // Add subject to list
  const handleAddSubject = (e) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!trimmedCode || !trimmedName) return;

    // prevent duplicate short codes
    if (subjects.some((s) => s.code === trimmedCode)) {
      alert("Subject code already exists");
      return;
    }

    const updated = [...subjects, { code: trimmedCode, name: trimmedName }];
    setSubjects(updated);
    setCode("");
    setName("");

    // Save immediately
    const data = loadAppData();
    saveAppData({
      ...data,
      subjects: updated,
    });
    setSavedMsg("Subject added.");
    clearSavedMsg();
  };

  const clearSavedMsg = () => {
    setTimeout(() => setSavedMsg(""), 1500);
  };

  // Remove subject (optional)
  const handleRemoveSubject = (codeToRemove) => {
    if (!confirm(`Remove subject ${codeToRemove}?`)) return;
    const updated = subjects.filter((s) => s.code !== codeToRemove);

    // Also clean it from timetable
    const updatedTT = {};
    DAYS.forEach((day) => {
      updatedTT[day] = timetable[day].map((slot) =>
        slot === codeToRemove ? "" : slot
      );
    });

    setSubjects(updated);
    setTimetable(updatedTT);

    const data = loadAppData();
    saveAppData({
      ...data,
      subjects: updated,
      timetable: updatedTT,
    });
    setSavedMsg("Subject removed.");
    clearSavedMsg();
  };

  // Change timetable cell
  const handleTimetableChange = (day, hourIndex, newCode) => {
    const updatedDayRow = [...timetable[day]];
    updatedDayRow[hourIndex] = newCode;

    const updatedTT = {
      ...timetable,
      [day]: updatedDayRow,
    };

    setTimetable(updatedTT);
  };

  // Save timetable to localStorage
  const handleSaveTimetable = () => {
  // Copy current timetable
  const updatedTT = { ...timetable };

  // Ensure break slot is stored as "BREAK"
  Object.keys(updatedTT).forEach((day) => {
    if (BREAK_SLOT[day] !== undefined) {
      updatedTT[day][BREAK_SLOT[day]] = "BREAK";
    }
  });

  // Save to LocalStorage
  const data = loadAppData();
  saveAppData({
    ...data,
    subjects,
    timetable: updatedTT,
  });

  setSavedMsg("Timetable saved.");
  clearSavedMsg();
};


  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Setup – Subjects & Timetable</h1>

      {savedMsg && (
        <div className="text-sm text-green-400 mb-2">{savedMsg}</div>
      )}

      {/* SUBJECTS SECTION */}
      <section className="bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-3">Subjects</h2>
        <form
          onSubmit={handleAddSubject}
          className="flex flex-col md:flex-row gap-3 mb-4"
        >
          <input
            type="text"
            placeholder="Short code (e.g. CD)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-gray-900 border border-gray-700 text-sm"
          />
          <input
            type="text"
            placeholder="Full name (e.g. Compiler Design)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-[2] px-3 py-2 rounded bg-gray-900 border border-gray-700 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm font-semibold"
          >
            Add
          </button>
        </form>

        {subjects.length === 0 ? (
          <p className="text-sm text-gray-400">No subjects added yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {subjects.map((s) => (
              <li
                key={s.code}
                className="flex items-center justify-between bg-gray-900 px-3 py-2 rounded border border-gray-700"
              >
                <div>
                  <span className="font-semibold">{s.code}</span>{" "}
                  <span className="text-gray-300">– {s.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(s.code)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* TIMETABLE SECTION */}
      <section className="bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-3">Weekly Timetable</h2>
        {subjects.length === 0 && (
          <p className="text-sm text-yellow-400 mb-3">
            Add at least one subject to configure the timetable.
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr>
                <th className="border border-gray-700 px-2 py-1 text-left">
                  Day
                </th>
                {Array.from({ length: 7 }).map((_, i) => (
                  <th
                    key={i}
                    className="border border-gray-700 px-2 py-1 text-center"
                  >
                    H{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day}>
                  <td className="border border-gray-700 px-2 py-1 font-semibold">
                    {day}
                  </td>

                  {Array.from({ length: 7 }).map((_, hourIndex) => {
                    const maxHours = HOURS_BY_DAY[day];

                    // slot is visually disabled (beyond allowed hours)
                    const isDisabled = hourIndex >= maxHours;

                    // Friday H5 break logic (index 4)
                    const isBreak =
                        BREAK_SLOT[day] !== undefined && BREAK_SLOT[day] === hourIndex;

                    const value =
                        !isDisabled && !isBreak && timetable[day]
                        ? timetable[day][hourIndex] || ""
                        : "";

                    return (
                        <td key={hourIndex} className="border border-gray-700 px-1 py-1">
                        {isDisabled ? (
                            <div className="text-center text-gray-600">–</div>
                        ) : isBreak ? (
                            <div className="text-center text-red-400 font-semibold">
                            Break
                            </div>
                        ) : (
                            <select
                            value={value}
                            onChange={(e) =>
                                handleTimetableChange(day, hourIndex, e.target.value)
                            }
                            className="w-full bg-gray-900 border border-gray-700 rounded px-1 py-1 text-xs"
                            >
                            <option value="">(none)</option>
                            {subjects.map((s) => (
                                <option key={s.code} value={s.code}>
                                {s.code}
                                </option>
                            ))}
                            </select>
                        )}
                        </td>
                    );
                    })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handleSaveTimetable}
          className="mt-4 px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-sm font-semibold"
        >
          Save Timetable
        </button>
      </section>
    </div>
  );
}
