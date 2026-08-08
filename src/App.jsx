import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PeriodTracker from "./pages/PeriodTracker";
import MoodTracker from "./pages/MoodTracker";
import MedicineReminder from "./pages/MedicineReminder";
import HealthReport from "./pages/HealthReport";
import Community from "./pages/Community";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/period" element={<PeriodTracker />} />
        <Route path="/mood" element={<MoodTracker />} />
        <Route path="/medicine" element={<MedicineReminder />} />
        <Route path="/health-report" element={<HealthReport />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;