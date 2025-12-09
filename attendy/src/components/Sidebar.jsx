import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `block px-3 py-2 rounded-md ${
      pathname === path
        ? "bg-gray-700 text-blue-400 font-semibold"
        : "hover:bg-gray-800"
    }`;

  return (
    <div
      className={`fixed top-0 left-0 h-full w-56 bg-gray-900 border-r border-gray-700 p-5 z-40 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static`}
    >
      <h1 className="text-xl font-bold mb-6">📚 Attendy</h1>
      <nav className="space-y-2">
        <Link onClick={() => setOpen(false)} to="/" className={linkClass("/")}>Dashboard</Link>
        <Link onClick={() => setOpen(false)} to="/mark" className={linkClass("/mark")}>Mark Attendance</Link>
        <Link onClick={() => setOpen(false)} to="/reports" className={linkClass("/reports")}>Reports</Link>
        <Link onClick={() => setOpen(false)} to="/setup" className={linkClass("/setup")}>Setup</Link>
        <Link onClick={() => setOpen(false)} to="/settings" className={linkClass("/settings")}>Settings</Link>
      </nav>
    </div>
  );
}
