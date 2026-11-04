import { Navigate, Route, Routes } from "react-router";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/LandingPage";
import Library from "./pages/LibraryPage";
import Login from "./pages/LoginPage";
import Profile from "./pages/ProfilePage";
import Settings from "./pages/SettingsPage";
import Signup from "./pages/SignUpPage";
import VerifyEmail from "./pages/VerifyEmailPage";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
