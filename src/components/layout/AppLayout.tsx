import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
