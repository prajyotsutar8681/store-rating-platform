import { useEffect, useState } from 'react';
import {
    Building2,
    KeyRound,
    LogOut,
    Star,
    Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type DashboardData = {
    totalUsers: number;
    totalStores: number;
    totalRatings: number;
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] =
        useState<DashboardData | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await api.get(
                    '/admin/dashboard',
                );

                setDashboard(response.data);
            } catch (err: any) {
                const message =
                    err.response?.data?.message ||
                    'Unable to load dashboard.';

                setError(
                    Array.isArray(message)
                        ? message.join(', ')
                        : message,
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const stats = [
        {
            title: 'Total Users',
            value: dashboard?.totalUsers ?? 0,
            icon: Users,
        },
        {
            title: 'Total Stores',
            value: dashboard?.totalStores ?? 0,
            icon: Building2,
        },
        {
            title: 'Total Ratings',
            value: dashboard?.totalRatings ?? 0,
            icon: Star,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            <header className="border-b border-[#E6E9EF] bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Store Rating Platform
                        </h1>

                        <p className="text-sm text-slate-500">
                            Admin Dashboard
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                navigate('/change-password')
                            }
                            className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <KeyRound size={16} />
                            Change password
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">
                        Dashboard
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Welcome back, {user?.name}.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-xl border border-[#E3E7EE] bg-white p-10 text-center text-slate-500 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                        Loading dashboard...
                    </div>
                ) : (
                    <>
                        <div className="grid gap-5 md:grid-cols-3">
                            {stats.map((stat) => {
                                const Icon = stat.icon;

                                return (
                                    <div
                                        key={stat.title}
                                        className="rounded-xl border border-[#E3E7EE] bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">
                                                    {stat.title}
                                                </p>

                                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                                    {stat.value}
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-[#F4F5F7] p-3">
                                                <Icon
                                                    size={23}
                                                    className="text-[#475569]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate('/admin/users')
                                }
                                className="rounded-xl border border-[#E3E7EE] bg-white p-6 text-left shadow-[0_1px_3px_rgba(16,24,40,0.04)] transition-colors hover:border-[#D8DEE8] hover:bg-[#F8FAFC]"
                            >
                                <Users
                                    size={22}
                                    className="mb-3 text-[#3157D5]"
                                />

                                <h3 className="font-semibold text-slate-900">
                                    Manage Users
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    View, search and manage platform
                                    users.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate('/admin/stores')
                                }
                                className="rounded-xl border border-[#E3E7EE] bg-white p-6 text-left shadow-[0_1px_3px_rgba(16,24,40,0.04)] transition-colors hover:border-[#D8DEE8] hover:bg-[#F8FAFC]"
                            >
                                <Building2
                                    size={22}
                                    className="mb-3 text-[#3157D5]"
                                />

                                <h3 className="font-semibold text-slate-900">
                                    Manage Stores
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    View stores, owners and ratings.
                                </p>
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}