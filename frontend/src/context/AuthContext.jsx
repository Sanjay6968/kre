import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const loginUser = (tokenVal, userData) => {
        localStorage.setItem('token', tokenVal);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(tokenVal);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ user, token, loginUser, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}
