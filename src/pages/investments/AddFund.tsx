import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/route-constants";
import { useEffect } from "react";

// Redirect to Mutual Funds page — add fund is now handled via modal
export default function AddFund() {
  const navigate = useNavigate();
  useEffect(() => { navigate(ROUTES.INVESTMENTS_FUNDS, { replace: true }); }, [navigate]);
  return null;
}