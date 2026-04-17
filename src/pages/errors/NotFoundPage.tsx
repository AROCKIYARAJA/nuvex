import { useNavigate } from "react-router-dom";
import { NuvexLogo } from "@/components/common/NuvexLogo";
import { ROUTES } from "@/constants/route-constants";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <NuvexLogo size={48} className="mb-6" />
      <h1 className="text-6xl font-bold font-display text-foreground mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-6">Page not found. The route you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate(ROUTES.CASHFLOW_DASHBOARD)}
        className="gradient-primary text-primary-foreground font-medium px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <i className="bx bx-home" />
        Go to Dashboard
      </button>
    </div>
  );
}
