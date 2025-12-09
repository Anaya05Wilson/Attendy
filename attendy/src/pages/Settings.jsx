import { useState } from "react";
import { loadAppData, saveAppData } from "../utils/storage";

export default function Settings() {
  const data = loadAppData();
  const [includeDL, setIncludeDL] = useState(data.settings?.includeDL ?? true);

  const handleReset = () => {
    if (!confirm("⚠ Reset all attendance and timetable? This cannot be undone.")) return;
    saveAppData({ subjects: [], timetable: {}, attendance: {}, settings: {} });
    alert("App data cleared.");
    location.reload();
  };

  const exportData = () => {
    const content = JSON.stringify(loadAppData(), null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Attendy-Backup.json";
    a.click();
  };

  const importData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    saveAppData(JSON.parse(text));
    alert("Backup restored successfully.");
    location.reload();
  };

  const saveSettings = () => {
    saveAppData({ ...data, settings: { includeDL } });
    alert("Settings saved.");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={includeDL}
          onChange={(e) => setIncludeDL(e.target.checked)}
        />
        Count Duty Leave as Present
      </label>

      <button
        onClick={saveSettings}
        className="bg-blue-600 px-4 py-2 rounded"
      >
        Save Settings
      </button>

      <hr className="border-gray-600" />

      <button
        className="bg-green-600 px-4 py-2 rounded"
        onClick={exportData}
      >
        Export Backup
      </button>

      <input type="file" accept=".json" onChange={importData} />

      <hr className="border-gray-600" />

      <button
        className="bg-red-600 px-4 py-2 rounded"
        onClick={handleReset}
      >
        Reset Semester
      </button>
    </div>
  );
}
