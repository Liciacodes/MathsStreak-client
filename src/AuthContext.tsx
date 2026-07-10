import { createContext, useContext, useState, type ReactNode } from "react";


interface AuthContextType {
    token: string | null;
    email: string | null;
    isLoggedIn: boolean;
    login: (token: string, email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'mathsstreak_token';
const EMAIL_KEY = 'mathsstreak_email';

export const AuthProvider = ({ children}: {children: ReactNode}) => {
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem(TOKEN_KEY)
    })
    const [email, setEmail] = useState<string | null>(() => {
        return localStorage.getItem(EMAIL_KEY)
    })
const login = (newToken: string, newEmail: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(EMAIL_KEY, newEmail)
      setToken(newToken);
      setEmail(newEmail)
}

const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    setToken(null)
    setEmail(null)
}

return(
<AuthContext.Provider value={{ token, email, isLoggedIn: !!token, login, logout}}>
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