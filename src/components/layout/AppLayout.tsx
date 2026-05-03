import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useEffect } from "react";
import { ROUTES } from "@/constants/route-constants";

export function AppLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "1") {
        navigate(ROUTES.CASHFLOW_DASHBOARD);
      } else if (event.altKey && event.key === "2") {
        navigate(ROUTES.CASHFLOW_ADD_EXPENSE);
      } else if (event.altKey && event.key === "3") {
        navigate(ROUTES.CASHFLOW_ADD_INCOME);
      } else if (event.altKey && event.key === "4") {
        navigate(ROUTES.INVESTMENTS_DASHBOARD);
      } else if (event.altKey && event.key === "5") {
        navigate(ROUTES.INVESTMENTS_METALS);
      } else if (event.altKey && event.key === "6") {
        navigate(ROUTES.INVESTMENTS_FUNDS);
      } else if (event.altKey && event.key === "7") {
        navigate(ROUTES.NETWORTH);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
