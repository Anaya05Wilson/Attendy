import { useEffect, useState } from "react";
import { loadAppData, saveAppData } from "../utils/storage";

const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const BREAK_SUBJECT = "BREAK"; // used for Friday H5 etc.

export default function MarkToday() {
  const [todayDate, setTodayDate] = useState("");
  const [dayName, setDayName] = useState("");
  const [slots, setSlots] = useState([]); // [{hourIndex, hourLabel, subject, status, eventName}]
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [dayType, setDayType] = useState("NORMAL"); // NORMAL / HOLIDAY / DL-DAY / NO-CLASS
  const [dayNote, setDayNote] = useState("");
  const [subjects, setSubjects] = useState([]); // FIX: this was missing before

  // Helper: load everything for a specific date string YYYY-MM-DD
  const loadForDate = (dateStr) => {
  const data = loadAppData();
  const subjectsFromData = data.subjects || [];
  const timetable = data.timetable || {};
  const attendance = data.attendance || {};

  setSubjects(subjectsFromData);

  // Build Date using local year/month/day to avoid UTC parsing issues
  // (new Date('YYYY-MM-DD') can be parsed as UTC and shift the day)
  const [yStr, mStr, dStr] = dateStr.split("-");
  const dateObj = new Date(Number(yStr), Number(mStr) - 1, Number(dStr));
  const dayIndex = dateObj.getDay();
  const currentDayName = WEEK_DAYS[dayIndex];

  setDayName(currentDayName);

  const todayTimetableRow = timetable[currentDayName];
  const existingRecord = attendance[dateStr];

// 🔥 If NO attendance exists → ALWAYS generate weekly timetable
if (!existingRecord) {
  if (todayTimetableRow) {
    const generated = todayTimetableRow
      .map((subjectCode, index) => {
        if (!subjectCode || subjectCode === BREAK_SUBJECT) return null;
        return {
          hourIndex: index,
          hourLabel: `H${index + 1}`,
          subject: subjectCode,
          status: "",
          eventName: "",
        };
      })
      .filter(Boolean);

    setDayType("NORMAL");
    setDayNote("");
    setSlots(generated);
    setLoading(false);
    return;
  }

  // No timetable row exists → treat as NO CLASS
  setDayType("NO-CLASS");
  setDayNote("No timetable for this weekday.");
  setSlots([]);
  setLoading(false);
  return;
}

// 🔥 If attendance exists → load it exactly as saved
setDayType(existingRecord.type);
setDayNote(existingRecord.note || "");

if (existingRecord.type === "NORMAL") {
  setSlots(
    existingRecord.slots.map((slot) => ({
      ...slot,
      hourLabel: `H${slot.hourIndex + 1}`,
    }))
  );
} else {
  setSlots([]);
}

setLoading(false);
return;

};



  // Initial load: current date
  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    setTodayDate(dateStr);
    setLoading(true);
    loadForDate(dateStr);
  }, []);

  const handleDateChange = (newDate) => {
  setTodayDate(newDate);
  setMessage("");
  loadForDate(newDate);
};


  const handleDayTypeChange = (newType) => {
  setDayType(newType);

  if (newType === "NORMAL") {
    // Reload timetable or existing attendance for this date
    loadForDate(todayDate);
  } else {
    // Holiday / No-class / Full DL → hide hourly slots
    setSlots([]);
  }
};


  const setStatus = (hourIndex, newStatus) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.hourIndex === hourIndex ? { ...slot, status: newStatus } : slot
      )
    );
  };

  const setEventName = (hourIndex, value) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.hourIndex === hourIndex ? { ...slot, eventName: value } : slot
      )
    );
  };

  const handleSave = () => {
    const data = loadAppData();
    const attendance = data.attendance || {};

    if (dayType !== "NORMAL") {
      attendance[todayDate] = {
        type: dayType,
        note: dayNote,
      };
    } else {
      const toSave = slots.map((slot) => ({
        hourIndex: slot.hourIndex,
        subject: slot.subject,
        status: slot.status,
        eventName: slot.eventName || "",
      }));

      attendance[todayDate] = {
        type: "NORMAL",
        slots: toSave,
      };
    }

    saveAppData({
      ...data,
      attendance,
    });

    setMessage("Attendance saved.");
    setTimeout(() => setMessage(""), 2000);
  };

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-1">Mark Attendance</h1>

      {/* Date picker */}
      <div className="flex flex-col gap-2 max-w-xs">
        <label className="text-xs text-gray-400">Select Date</label>
        <input
          type="date"
          value={todayDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
        />
        <p className="text-xs text-gray-400">
          {dayName}
        </p>
      </div>

      {/* Day Type selector */}
      <div className="mt-2 flex flex-col gap-2 max-w-xs">
        <label className="text-xs text-gray-400">Day Type</label>
        <select
          value={dayType}
          onChange={(e) => handleDayTypeChange(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
        >
          <option value="NORMAL">Normal Day</option>
          <option value="HOLIDAY">Holiday (No Classes)</option>
          <option value="DL-DAY">Full Duty Leave Day (Event / Fest)</option>
          <option value="NO-CLASS">No Classes (Unexpected)</option>
        </select>
      </div>

      {dayType !== "NORMAL" && (
        <input
          type="text"
          className="w-full bg-gray-800 border border-gray-600 px-2 py-2 rounded text-sm"
          placeholder="Reason (Holiday, Fest name, Strike, etc)"
          value={dayNote}
          onChange={(e) => setDayNote(e.target.value)}
        />
      )}

      {message && <p className="text-green-400 text-sm">{message}</p>}

      {/* Only show per-hour controls for NORMAL days */}
      {dayType === "NORMAL" && (
        <>
          {slots.length === 0 ? (
            <p className="text-sm text-yellow-400">
              No periods found for today in timetable.
            </p>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => (
                <div
                  key={slot.hourIndex}
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">{slot.hourLabel}</p>

                      {/* Subject override dropdown */}
                      <select
                        value={slot.subject}
                        onChange={(e) =>
                          setSlots((prev) =>
                            prev.map((s) =>
                              s.hourIndex === slot.hourIndex
                                ? { ...s, subject: e.target.value }
                                : s
                            )
                          )
                        }
                        className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm w-full"
                      >
                        {subjects.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.code} — {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {["P", "A", "DL", "TL"].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setStatus(slot.hourIndex, code)}
                          className={`px-2 py-1 text-xs rounded border ${
                            slot.status === code
                              ? "bg-blue-600 border-blue-400"
                              : "bg-gray-900 border-gray-600 hover:bg-gray-700"
                          }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>

                  {slot.status === "DL" && (
                    <div>
                      <label className="text-xs text-gray-300 block mb-1">
                        Event / Reason (optional)
                      </label>
                      <input
                        type="text"
                        value={slot.eventName}
                        onChange={(e) =>
                          setEventName(slot.hourIndex, e.target.value)
                        }
                        className="w-full px-2 py-1 rounded bg-gray-900 border border-gray-700 text-xs"
                        placeholder="Hackathon, NSS, Workshop..."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={handleSave}
        className="mt-2 px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-sm font-semibold"
      >
        Save Attendance
      </button>
    </div>
  );
}
