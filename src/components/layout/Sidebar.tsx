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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static left-0 top-0 h-screen w-64 bg-gray-900 text-white transition-transform duration-300 z-40 pt-16 md:pt-0`}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-bold">SMS Sender Pro</h2>
          <p className="text-xs text-gray-400">Admin Panel</p>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <p>Version 1.0</p>
            <p>© 2024 SMS Sender</p>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
