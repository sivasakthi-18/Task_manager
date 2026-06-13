import { Routes, Route } from "react-router-dom";
import Login from "../Frontend/src/pages/Login";
import Signup from "../Frontend/src/pages/Signup";
import Dashboard from "../Frontend/src/pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;