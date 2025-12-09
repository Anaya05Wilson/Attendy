import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Setup from "./pages/Setup";
import MarkToday from "./pages/MarkToday";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <Router>
      <div className="flex dark:bg-gray-900 dark:text-white min-h-screen overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar open={open} setOpen={setOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto md:ml-0">

          {/* Top Header Row */}
          <header className="md:hidden flex items-center gap-3 p-4 border-b border-gray-700">
            <button
              onClick={() => setOpen(true)}
              className="text-xl p-2 rounded bg-gray-800 border border-gray-600"
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold">📚 Attendy</h1>
          </header>

          {/* Page Content */}
          <div className="p-5">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/mark" element={<MarkToday />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>

        </main>
      </div>
    </Router>
  );
}
