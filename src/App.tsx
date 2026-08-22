import { Routes, Route } from "react-router";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import StudySetPage from "./pages/StudySetPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App()
{
    return (

      <Routes>
          <Route path="/" element={<LandingPage />}  />
          <Route path="/login" element={<LoginPage />}  />
          <Route path="/register" element={<RegisterPage />}  />

          <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />}  />
                <Route path="/study/:id" element={<StudySetPage />}  />
          </Route>
          
      </Routes>

    );
}

export default App;