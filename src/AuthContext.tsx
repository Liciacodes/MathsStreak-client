import { createContext, useContext, useState, type ReactNode } from "react";


interface AuthContextType {
    token: string | null;
    isLoggedIn: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'quizstreak_token';

export const AuthProvider = ({ children}: {children: ReactNode}) => {
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem(TOKEN_KEY)
    })
const login = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
      setToken(newToken);
}

const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
}

return(
<AuthContext.Provider value={{ token, isLoggedIn: !!token, login, logout}}>
    {children}
</AuthContext.Provider>
);

};

export const useAuth = (): AuthContextType => {
const context = useContext(AuthContext)

if(!context) {
    throw new Error('useAuth must be used within an AuthProvider');

}
return context;
}