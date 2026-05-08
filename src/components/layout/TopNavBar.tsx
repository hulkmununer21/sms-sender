import React from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Bell, User } from "lucide-react";
import { useState } from "react";

export const TopNavBar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-matrix-dark border-b-2 border-matrix-neon-green shadow-matrix">
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <h1 className="matrix-title text-2xl">
            ◈ SMS NEXUS ◈
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2 text-matrix-neon-cyan hover:text-matrix-neon-green transition duration-200 hover:bg-matrix-black rounded-sm">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-matrix-neon-pink rounded-full animate-pulse"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 text-matrix-neon-cyan hover:text-matrix-neon-green transition duration-200 hover:bg-matrix-black rounded-sm"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-bold hidden md:block max-w-xs truncate text-matrix-neon-green">
                {user?.email}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 card-matrix-cyan">
                <div className="p-4 border-b-2 border-matrix-neon-cyan">
                  <p className="text-xs text-matrix-neon-cyan font-bold">
                    &gt; LOGGED IN AS
                  </p>
                  <p className="text-sm font-bold text-matrix-neon-green truncate mt-1">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-matrix-neon-pink hover:text-matrix-neon-yellow hover:bg-matrix-dark flex items-center gap-2 transition duration-200 font-bold"
                >
                  <LogOut className="h-4 w-4" />
                  ◈ DISCONNECT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
