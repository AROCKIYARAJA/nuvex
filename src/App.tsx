import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AppLayout } from "@/components/layout/AppLayout";
import { ROUTES } from "@/constants/route-constants";

import CashflowDashboard from "@/pages/cashflow/CashflowDashboard";
import AddExpense from "@/pages/cashflow/AddExpense";
import AddIncome from "@/pages/cashflow/AddIncome";
import InvestmentDashboard from "@/pages/investments/InvestmentDashboard";
import BullionVault from "@/pages/investments/BullionVault";
import MutualFunds from "@/pages/investments/MutualFunds";
import AddFund from "@/pages/investments/AddFund";
import OverallNetworth from "@/pages/networth/OverallNetworth";
import Profile from "@/pages/profile/Profile";
import NotFoundPage from "@/pages/errors/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.CASHFLOW_DASHBOARD} replace />} />
            <Route element={<AppLayout />}>
              <Route path={ROUTES.CASHFLOW_DASHBOARD} element={<CashflowDashboard />} />
              <Route path={ROUTES.CASHFLOW_ADD_EXPENSE} element={<AddExpense />} />
              <Route path={ROUTES.CASHFLOW_ADD_INCOME} element={<AddIncome />} />
              <Route path={ROUTES.INVESTMENTS_DASHBOARD} element={<InvestmentDashboard />} />
              <Route path={ROUTES.INVESTMENTS_METALS} element={<BullionVault />} />
              <Route path={ROUTES.INVESTMENTS_FUNDS} element={<MutualFunds />} />
              <Route path={ROUTES.INVESTMENTS_FUNDS_NEW} element={<AddFund />} />
              <Route path={ROUTES.NETWORTH} element={<OverallNetworth />} />
              <Route path={ROUTES.PROFILE} element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;