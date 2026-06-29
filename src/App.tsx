import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import QuizPage from "./pages/QuizPage";
import { AuthProvider, useAuth } from "./AuthContext";

function AppRoutes() {
const {isLoggedIn} = useAuth()

  return (
 
   <Routes>
    <Route path="/" element={<Navigate to={isLoggedIn ? '/quiz' : '/login'} replace />}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/register" element={<RegisterPage/>}/>
    <Route path="/quiz" element={<QuizPage/>}/>
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