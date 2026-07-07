import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import QuizPage from "./pages/QuizPage";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import { StreakHistory } from "./pages/streak";

function AppRoutes() {
const {isLoggedIn} = useAuth()

  return (
 
   <Routes>
    <Route path="/" 
    element={<Navigate to={isLoggedIn ? '/quiz' : '/login'} replace />}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/register" element={<RegisterPage/>}/>
    <Route path="/streak" element={
      <ProtectedRoute>
        <StreakHistory/>
      </ProtectedRoute>
    }/>
    <Route path="/quiz" element={
      <ProtectedRoute>
        <QuizPage/>
     
      </ProtectedRoute>
    }/>
   </Routes>
  
  );
}



function App()  {
  return (
    <AuthProvider>
      <BrowserRouter>
      <AppRoutes/>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;