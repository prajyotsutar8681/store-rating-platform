import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

import api from '../services/api';

type Role = 'ADMIN' | 'USER' | 'STORE_OWNER';

type User = {
    id: number;
    name: string;
    email: string;
    address: string;
    role: Role;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (
        email: string,
        password: string,
    ) => Promise<User>;
    register: (
        name: string,
        email: string,
        address: string,
        password: string,
    ) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(
    undefined,
);

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setLoading(false);
            return;
        }

        api.get('/auth/me')
            .then((response) => {
                setUser(response.data.user);
            })
            .catch(() => {
                localStorage.removeItem('accessToken');
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (
        email: string,
        password: string,
    ) => {
        const response = await api.post('/auth/login', {
            email,
            password,
        });

        const { accessToken, user } = response.data;

        localStorage.setItem('accessToken', accessToken);
        setUser(user);

        return user;
    };

    const register = async (
        name: string,
        email: string,
        address: string,
        password: string,
    ) => {
        await api.post('/auth/register', {
            name,
            email,
            address,
            password,
        });
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider',
        );
    }

    return context;
}