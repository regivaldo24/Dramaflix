import { BrowserRouter, Route, Routes, Link, useLocation } from "react-router-dom";
import { Home, MonitorPlay, Bookmark, Smile } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import PlayerPage from "./pages/Player";
import ShortsPage from "./pages/Shorts";
import MyListPage from "./pages/MyList";
import ProfilePage from "./pages/Profile";
import AccountPage from "./pages/Account";
import RechargeHistoryPage from "./pages/RechargeHistory";
import UnlockHistoryPage from "./pages/UnlockHistory";
import BonusHistoryPage from "./pages/BonusHistory";
import StorePage from "./pages/Store";
import QAPage from "./pages/QA";
import RewardsPage from "./pages/Rewards";
import SettingsPage from "./pages/Settings";
import UserContractPage from "./pages/UserContract";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import TermsOfUsePage from "./pages/TermsOfUse";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import EditProfilePage from "./pages/EditProfile";
import DMCAPage from "./pages/DMCA";
import VipCentralPage from "./pages/VipCentral";
import SuccessPage from "./pages/Success";
import FailurePage from "./pages/Failure";
import AccountManagementPage from "./pages/AccountManagement";
import { useLanguage } from "./contexts/LanguageContext";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMovies from "./pages/admin/Movies";
import AdminAddMovie from "./pages/admin/AddMovie";
import AdminEditMovie from "./pages/admin/EditMovie";
import AdminUsers from "./pages/admin/Users";
import AdminPlans from "./pages/admin/Plans";
import AdminPayments from "./pages/admin/Payments";
import AdminChat from "./components/AdminComponents/AdminChat";
import ChatWidget from "./components/ChatWidget";

function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();
  // Hide BottomNav on certain pages like Account or Admin
  if (["/shorts", "/account", "/account-management", "/recharge-history", "/unlock-history", "/bonus-history", "/store", "/qa", "/settings", "/user-contract", "/terms-of-use", "/termos", "/privacy-policy", "/politica-privacidade", "/edit-profile", "/contato", "/sobre", "/dmca"].includes(location.pathname) || location.pathname.startsWith('/admin')) return null;

  const navItems = [
    { path: "/", label: t("discover"), icon: Home },
    { path: "/shorts", label: "Shorts", icon: MonitorPlay },
    { path: "/my-list", label: t("mylist"), icon: Bookmark },
    { path: "/profile", label: t("profile"), icon: Smile },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 pb-4 pt-2 px-4 z-50">
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto relative pb-2 md:px-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 gap-1 hover:text-white transition-all duration-300 relative ${
                isActive ? "text-white" : "text-neutral-500"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <Icon size={24} className={isActive ? "fill-white/10 stroke-2" : "stroke-2"} />
                <span className="text-[10px] md:text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 w-1 h-1 bg-yellow-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/play/:id" element={<PlayerPage />} />
          <Route path="/shorts" element={<ShortsPage />} />
          <Route path="/shorts/:id" element={<ShortsPage />} />
          <Route path="/my-list" element={<MyListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account-management" element={<AccountManagementPage />} />
          <Route path="/recharge-history" element={<RechargeHistoryPage />} />
          <Route path="/unlock-history" element={<UnlockHistoryPage />} />
          <Route path="/bonus-history" element={<BonusHistoryPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/qa" element={<QAPage />} />
          <Route path="/recompensa" element={<RewardsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/vip-central" element={<VipCentralPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/failure" element={<FailurePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/user-contract" element={<UserContractPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          <Route path="/termos" element={<UserContractPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/politica-privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/dmca" element={<DMCAPage />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="filmes" element={<AdminMovies />} />
            <Route path="add_filme" element={<AdminAddMovie />} />
            <Route path="edit_filme/:id" element={<AdminEditMovie />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="planos" element={<AdminPlans />} />
            <Route path="pagamentos" element={<AdminPayments />} />
            <Route path="chat" element={<AdminChat />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white font-sans">
        <div className="w-full max-w-7xl mx-auto min-h-screen relative shadow-none bg-black border-x-0 lg:border-x border-neutral-900">
          <AnimatedRoutes />
          <BottomNav />
          <ChatWidget />
        </div>
      </div>
    </BrowserRouter>
  );
}
