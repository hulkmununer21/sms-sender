import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, AlertCircle, Loader, ShieldAlert } from "lucide-react";

export const AuthForm: React.FC = () => {
  const { signIn, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!email || !password) {
      setLocalError("Email and password are required");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    try {
      await signIn(email, password);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      setLocalError(errorMessage);
    }
  };

  const displayError = localError || error?.message;

  return (
    <div className="min-h-screen bg-matrix-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-matrix-neon-green rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-matrix-neon-cyan rounded-full blur-3xl"></div>
      </div>

      <div className="card-matrix-green p-8 w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="matrix-title text-4xl mb-2">◈◈◈</h1>
          <h2 className="matrix-title text-3xl">SMS NEXUS</h2>
          <p className="text-matrix-neon-cyan mt-3 text-sm font-mono">&gt; ACCESS AUTHENTICATION PROTOCOL</p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-6 p-4 border-2 border-matrix-neon-pink rounded-sm bg-matrix-dark flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-matrix-neon-pink flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-matrix-neon-pink">◈ AUTHENTICATION ERROR</p>
              <p className="text-sm text-matrix-neon-pink mt-1 font-mono">&gt; {displayError}</p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-6 p-4 border-2 border-matrix-neon-yellow rounded-sm bg-matrix-dark flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-matrix-neon-yellow flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-matrix-neon-yellow">◈ SECURE ZONE</p>
            <p className="text-xs text-matrix-neon-cyan mt-1 font-mono">
              &gt; AUTHORIZED USERS ONLY. REQUEST CREDENTIALS FROM ADMIN.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-matrix-neon-green mb-1 font-mono"
            >
              $ EMAIL
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-matrix-neon-green opacity-70" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@nexus.sys"
                className="input-matrix pl-10"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-matrix-neon-green mb-1 font-mono"
            >
              $ PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-matrix-neon-green opacity-70" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-matrix pl-10"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-matrix-primary w-full py-2 font-bold mt-6 flex items-center justify-center gap-2 uppercase"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                CONNECTING...
              </>
            ) : (
              <>◈ AUTHENTICATE ◈</>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-matrix-neon-green">
          <p className="text-center text-xs text-matrix-neon-cyan font-mono">
            &gt; DATA ISOLATION: ACTIVE | ENCRYPTION: ON
          </p>
          <p className="text-center text-xs text-matrix-neon-green mt-2 font-mono">
            &gt; TERMS OF SERVICE ACCEPTED
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
