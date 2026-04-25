import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NuvexLogo } from "@/components/common/NuvexLogo";
import { ROUTES } from "@/constants/route-constants";

const USER_KEY = import.meta.env.VITE_LS_NUVEX_USER_MODE;
const ADMIN_VALUE = import.meta.env.VITE_ADMIN;
const GUEST_VALUE = "nuvex@guest.com";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const adminEmail = import.meta.env.VITE_ADMIN as string | undefined;
  const adminPwd = import.meta.env.VITE_PWD as string | undefined;

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (
      adminEmail &&
      adminPwd &&
      email.trim().toLowerCase() === adminEmail.trim().toLowerCase() &&
      password === adminPwd
    ) {
      localStorage.setItem(USER_KEY, ADMIN_VALUE);
      toast.success("Welcome back, Admin");
      navigate(ROUTES.CASHFLOW_DASHBOARD, { replace: true });
    } else {
      toast.error("Invalid admin credentials");
    }
    setSubmitting(false);
  };

  const handleGuest = () => {
    localStorage.setItem(USER_KEY, GUEST_VALUE);
    toast.success("Continuing as Guest");
    navigate(ROUTES.CASHFLOW_DASHBOARD, { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center px-4">
      {/* Decorative grid background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Corner accents */}
      <div aria-hidden className="absolute top-6 left-6 w-24 h-12 rounded-md border border-border/60 bg-card/40" />
      <div aria-hidden className="absolute top-6 right-6 w-24 h-12 rounded-md border border-border/60 bg-card/40" />
      <div aria-hidden className="absolute bottom-6 left-6 w-24 h-12 rounded-md border border-border/60 bg-card/40" />
      <div aria-hidden className="absolute bottom-6 right-6 w-24 h-12 rounded-md border border-border/60 bg-card/40" />

      <div className="relative w-full max-w-md bg-card/80 backdrop-blur border border-border rounded-2xl shadow-card p-8 animate-fade-in">
        <div className="flex justify-center mb-4">
          <NuvexLogo size={48} />
        </div>
        <h1 className="text-center font-display font-bold text-2xl text-foreground">Welcome Back</h1>
        <p className="text-center text-xs text-muted-foreground mt-1">
          Secure access to your Nuvex finance dashboard
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <div className="relative">
            <i className="bx bx-envelope absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email address"
              className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-3 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-ring text-sm"
            />
          </div>
          <div className="relative">
            <i className="bx bx-lock-alt absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPwd ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg pl-10 pr-10 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-ring text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              <i className={`bx ${showPwd ? "bx-hide" : "bx-show"}`} />
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full gradient-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          OR
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          className="w-full bg-secondary text-secondary-foreground text-sm font-medium py-2.5 rounded-lg border border-border hover:bg-secondary/70 transition-colors flex items-center justify-center gap-2"
        >
          <i className="bx bx-user-circle text-base" />
          Guest Mode
        </button>
      </div>
    </div>
  );
}
