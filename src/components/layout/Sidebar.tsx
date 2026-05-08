import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  Send,
  Mail,
  Settings,
  Menu,
  X,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { label: "Contacts", path: "/contacts", icon: Users },
    { label: "Campaigns", path: "/campaigns", icon: Send },
    { label: "Message Logs", path: "/logs", icon: Mail },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-matrix-neon-green text-matrix-black rounded-sm shadow-matrix"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static left-0 top-0 h-screen w-64 bg-matrix-black border-r-2 border-matrix-neon-green text-matrix-neon-green transition-transform duration-300 z-40 pt-16 md:pt-0`}
        style={{ boxShadow: 'inset 0 0 20px rgba(0, 255, 65, 0.1)' }}
      >
        <div className="p-6 border-b-2 border-matrix-neon-green">
          <h2 className="text-lg font-bold matrix-text">
            ◈ SMS SENDER ◈
          </h2>
          <p className="text-xs text-matrix-neon-cyan">
            &gt; ADMIN TERMINAL
          </p>
        </div>

        <nav className="mt-6 px-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 border-l-4 ${
                  active
                    ? "bg-matrix-dark border-l-matrix-neon-green text-matrix-neon-green shadow-matrix"
                    : "border-l-transparent text-matrix-neon-cyan hover:bg-matrix-dark hover:border-l-matrix-neon-cyan hover:text-matrix-neon-green"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-matrix-neon-green bg-matrix-dark">
          <div className="text-xs text-matrix-neon-cyan space-y-1 font-mono">
            <p>&gt; VER 1.0/MATRIX</p>
            <p>&gt; © 2024 NEXUS</p>
            <p className="text-matrix-neon-yellow text-xs mt-2">◈ ACTIVE ◈</p>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-80 z-30"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
