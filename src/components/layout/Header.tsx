import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { NuvexLogo } from "@/components/common/NuvexLogo";
import { APP_NAME, THEMES } from "@/constants/app-constants";
import { ROUTES } from "@/constants/route-constants";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const NAV_MODULES = [
  {
    label: "Cashflow",
    icon: "bx-wallet",
    children: [
      {
        label: "Dashboard - Alt + 1",
        path: ROUTES.CASHFLOW_DASHBOARD,
        icon: "bx-grid-alt",
      },
      {
        label: "Add Expense - Alt + 2",
        path: ROUTES.CASHFLOW_ADD_EXPENSE,
        icon: "bx-minus-circle",
      },
      {
        label: "Add Income - Alt + 3",
        path: ROUTES.CASHFLOW_ADD_INCOME,
        icon: "bx-plus-circle",
      },
    ],
  },
  {
    label: "Investments",
    icon: "bx-line-chart",
    children: [
      {
        label: "Dashboard - Alt + 4",
        path: ROUTES.INVESTMENTS_DASHBOARD,
        icon: "bx-grid-alt",
      },
      {
        label: "Bullion Vault - Alt + 5",
        path: ROUTES.INVESTMENTS_METALS,
        icon: "bx-coin",
      },
      {
        label: "Mutual Funds - Alt + 6",
        path: ROUTES.INVESTMENTS_FUNDS,
        icon: "bx-bar-chart-alt-2",
      },
    ],
  },
  {
    label: "Networth Tracker",
    icon: "bx-trophy",
    children: [
      {
        label: "Overall Networth - Alt + 7",
        path: ROUTES.NETWORTH,
        icon: "bx-line-chart-down",
      },
    ],
  },
];

const THEME_OPTIONS = [
  { value: THEMES.DARK, label: "Dark", icon: "bx-moon" },
  { value: THEMES.LIGHT, label: "Light", icon: "bx-sun" },
  { value: THEMES.SYSTEM, label: "System", icon: "bx-laptop" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node))
        setNavOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node))
        setThemeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const currentThemeIcon =
    THEME_OPTIONS.find((t) => t.value === theme)?.icon || "bx-moon";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border glass">
      <div className="container flex items-center justify-between h-14 px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.CASHFLOW_DASHBOARD}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <NuvexLogo size={28} />
            <span className="font-display font-bold text-foreground text-lg hidden sm:inline">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav dropdown */}
          <div ref={navRef} className="relative hidden md:block">
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <i className="bx bx-grid-alt" />
              Modules
              <i
                className={cn(
                  "bx bx-chevron-down text-xs transition-transform",
                  navOpen && "rotate-180",
                )}
              />
            </button>
            {navOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-card border border-border rounded-xl shadow-elevated py-1 animate-fade-in">
                {NAV_MODULES.map((mod) => (
                  <div key={mod.label}>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <i className={`bx ${mod.icon}`} />
                      {mod.label}
                    </div>
                    {mod.children.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setNavOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent transition-colors",
                          location.pathname === item.path &&
                            "text-primary bg-accent",
                        )}
                      >
                        <i className={`bx ${item.icon} text-base`} />
                        <div className="w-full flex justify-between">
                          <span>{item.label.split("-")[0]}</span>
                          <span className=" text-gray-600">
                            {item.label.split("-")[1]}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Theme */}
          <div ref={themeRef} className="relative">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <i className={`bx ${currentThemeIcon} text-lg`} />
            </button>
            {themeOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-xl shadow-elevated py-1 animate-fade-in">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTheme(opt.value as any);
                      setThemeOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent transition-colors",
                      theme === opt.value && "text-primary bg-accent",
                    )}
                  >
                    <i className={`bx ${opt.icon}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <button
            onClick={() => navigate(ROUTES.PROFILE)}
            className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <i className="bx bx-user text-sm" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors md:hidden text-muted-foreground"
          >
            <i
              className={`bx ${mobileMenuOpen ? "bx-x" : "bx-menu"} text-xl`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="p-3 space-y-1">
            {NAV_MODULES.map((mod) => (
              <div key={mod.label}>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <i className={`bx ${mod.icon}`} />
                  {mod.label}
                </div>
                {mod.children.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 rounded-lg hover:bg-accent transition-colors",
                      location.pathname === item.path &&
                        "text-primary bg-accent",
                    )}
                  >
                    <i className={`bx ${item.icon}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
            <button
              onClick={() => navigate(ROUTES.PROFILE)}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 rounded-lg hover:bg-accent transition-colors",
                location.pathname === ROUTES.PROFILE &&
                  "text-primary bg-accent",
              )}
            >
              <i className="bx bx-user" />
              Profile
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
