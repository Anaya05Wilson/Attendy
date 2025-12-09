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

const BREAK_SUBJECT = "BREAK"; // matches what we saved for Friday H5

const STATUS_LABELS = {
  P: "Present",
  A: "Absent",
  DL: "Duty Leave",
  TL: "Teacher Leave",
};

export default function MarkToday() {
  const [todayDate, setTodayDate] = useState("");
  const [dayName, setDayName] = useState("");
  const [slots, setSlots] = useState([]); // [{hourIndex, subject, status, eventName}]
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [dayType, setDayType] = useState("NORMAL"); // NORMAL / HOLIDAY / DL-DAY / NO-CLASS
  const [dayNote, setDayNote] = useState("");

  useEffect(() => {
    const now = new Date();
    const dayIndex = now.getDay();
    const currentDayName = WEEK_DAYS[dayIndex];
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    setTodayDate(dateStr);
    setDayName(currentDayName);

    const data = loadAppData();
    const timetable = data.timetable || {};
    const attendance = data.attendance || {};

    // If no timetable row for this day (e.g., Saturday/Sunday or not configured)
    if (!timetable[currentDayName]) {
      setSlots([]);
      setLoading(false);
      setMessage(
        currentDayName === "Saturday" || currentDayName === "Sunday"
          ? "No timetable configured for today. You can add Saturday logic later."
          : "No timetable found. Please configure it from the Setup page."
      );
      return;
    }

    const todayTimetableRow = timetable[currentDayName]; // array of subject codes

    // Check if we already have attendance stored for this date
    const existingRecord = attendance[dateStr];

    // If record exists and is not NORMAL → it's a Holiday / DL-Day / No-Class
    if (existingRecord && existingRecord.type && existingRecord.type !== "NORMAL") {
      setDayType(existingRecord.type);
      setDayNote(existingRecord.note || "");
      setSlots([]); // no hourly slots for non-normal days
      setLoading(false);
      return;
    }

    // For normal day, we might have existing hour-wise slots
    let existingSlots = [];
    if (existingRecord && existingRecord.type === "NORMAL") {
      existingSlots = existingRecord.slots || [];
    }

    const newSlots = todayTimetableRow
      .map((subjectCode, index) => {
        const hourIndex = index; // 0-based
        if (!subjectCode || subjectCode === BREAK_SUBJECT) {
          return null; // skip breaks and empty
        }

        const existingSlot = existingSlots.find(
          (s) => s.hourIndex === hourIndex
        );

        return {
          hourIndex,
          hourLabel: `H${hourIndex + 1}`,
          subject: existingSlot?.subject || subjectCode,
          status: existingSlot?.status || "",
          eventName: existingSlot?.eventName || "",
        };
      })
      .filter(Boolean);

    setDayType("NORMAL");
    setDayNote("");
    setSlots(newSlots);
    setLoading(false);
  }, []);

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
      // holiday / DL-day / no-class
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
    return <p>Loading today’s timetable…</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-1">Mark Attendance</h1>
      <p className="text-sm text-gray-300">
        {dayName}, {todayDate}
      </p>

      {/* Day Type selector */}
      <div className="mt-3 flex flex-col gap-2 max-w-xs">
        <label className="text-xs text-gray-400">Day Type</label>
        <select
          value={dayType}
          onChange={(e) => setDayType(e.target.value)}
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

      {/* Only show hour-wise slots for NORMAL days */}
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
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">
                        {slot.hourLabel}
                      </p>
                      <p className="text-sm font-semibold">
                        {slot.subject}
                      </p>
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
