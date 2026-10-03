import { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    ArrowUpDown,
    Building2,
    KeyRound,
    LogOut,
    Star,
    Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type RatingUser = {
    id: number;
    name: string;
    email: string;
    address: string;
};

type StoreRating = {
    ratingId: number;
    rating: number;
    user: RatingUser;
    ratedAt: string;
    updatedAt: string;
};

type OwnerDashboardData = {
    store: {
        id: number;
        name: string;
        email: string;
        address: string;
    };
    averageRating: number;
    totalRatings: number;
    ratings: StoreRating[];
};

type SortField = 'name' | 'email' | 'address' | 'rating' | 'ratedAt';

type SortDirection = 'asc' | 'desc';

export default function OwnerDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] =
        useState<OwnerDashboardData | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [sortField, setSortField] = useState<SortField>('ratedAt');
    const [sortDirection, setSortDirection] =
        useState<SortDirection>('desc');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await api.get('/owner/dashboard');

                setDashboard(response.data);
            } catch (err: any) {
                const message =
                    err.response?.data?.message ||
                    'Unable to load owner dashboard.';

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

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((current) =>
                current === 'asc' ? 'desc' : 'asc',
            );
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedRatings = useMemo(() => {
        if (!dashboard) {
            return [];
        }

        return [...dashboard.ratings].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'name':
                    comparison = a.user.name.localeCompare(b.user.name);
                    break;

                case 'email':
                    comparison = a.user.email.localeCompare(b.user.email);
                    break;

                case 'address':
                    comparison = a.user.address.localeCompare(
                        b.user.address,
                    );
                    break;

                case 'rating':
                    comparison = a.rating - b.rating;
                    break;

                case 'ratedAt':
                    comparison =
                        new Date(a.ratedAt).getTime() -
                        new Date(b.ratedAt).getTime();
                    break;
            }

            return sortDirection === 'asc'
                ? comparison
                : -comparison;
        });
    }, [dashboard, sortField, sortDirection]);

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown size={15} />;
        }

        return (
            <span className="text-xs">
                {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            <header className="border-b border-[#E6E9EF] bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="rounded-lg p-2 text-slate-600 hover:bg-[#F3F5F8]"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                                Store Rating Platform
                            </h1>

                            <p className="text-sm text-slate-500">
                                Store Owner Dashboard
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                navigate('/change-password')
                            }
                            className="flex items-center gap-2 rounded-lg border border-[#D8DEE8] px-3 py-2 text-sm font-medium text-[#3157D5] hover:bg-[#F8FAFC]"
                        >
                            <KeyRound size={16} />
                            Change password
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg bg-[#3157D5] px-3 py-2 text-sm font-medium text-white hover:bg-[#2849B8]"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                        Owner Dashboard
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Welcome, {user?.name}.
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
                ) : dashboard ? (
                    <>
                        <div className="mb-6 rounded-xl border border-[#E3E7EE] bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-[#F1F4F8] p-3">
                                    <Building2
                                        size={24}
                                        className="text-[#3157D5]"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">
                                        {dashboard.store.name}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {dashboard.store.email}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {dashboard.store.address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 grid gap-5 md:grid-cols-2">
                            <div className="rounded-xl border border-[#E3E7EE] bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Average Rating
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">
                                            <Star
                                                size={25}
                                                className="fill-yellow-400 text-yellow-400"
                                            />

                                            <span className="text-3xl font-semibold tracking-tight text-slate-900">
                                                {dashboard.averageRating.toFixed(
                                                    2,
                                                )}
                                            </span>

                                            <span className="text-slate-500">
                                                / 5
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#E3E7EE] bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Total Ratings
                                        </p>

                                        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                                            {dashboard.totalRatings}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-[#F1F4F8] p-3">
                                        <Users
                                            size={23}
                                            className="text-[#3157D5]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold text-slate-900">
                                    Customer Ratings
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Users who have rated your store.
                                </p>
                            </div>

                            {dashboard.ratings.length === 0 ? (
                                <div className="rounded-xl border border-[#E3E7EE] bg-white p-10 text-center text-slate-500 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                                    No ratings have been submitted
                                    yet.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-xl border border-[#E3E7EE] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="border-b border-[#E3E7EE] bg-[#F8F9FB]">
                                                <tr>
                                                    <th className="px-5 py-4 text-sm font-semibold text-[#3157D5]">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSort(
                                                                    'name',
                                                                )
                                                            }
                                                            className="flex items-center gap-2 hover:text-[#2849B8]"
                                                        >
                                                            User
                                                            {getSortIcon(
                                                                'name',
                                                            )}
                                                        </button>
                                                    </th>

                                                    <th className="px-5 py-4 text-sm font-semibold text-[#3157D5]">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSort(
                                                                    'email',
                                                                )
                                                            }
                                                            className="flex items-center gap-2 hover:text-[#2849B8]"
                                                        >
                                                            Email
                                                            {getSortIcon(
                                                                'email',
                                                            )}
                                                        </button>
                                                    </th>

                                                    <th className="px-5 py-4 text-sm font-semibold text-[#3157D5]">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSort(
                                                                    'address',
                                                                )
                                                            }
                                                            className="flex items-center gap-2 hover:text-[#2849B8]"
                                                        >
                                                            Address
                                                            {getSortIcon(
                                                                'address',
                                                            )}
                                                        </button>
                                                    </th>

                                                    <th className="px-5 py-4 text-sm font-semibold text-[#3157D5]">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSort(
                                                                    'rating',
                                                                )
                                                            }
                                                            className="flex items-center gap-2 hover:text-[#2849B8]"
                                                        >
                                                            Rating
                                                            {getSortIcon(
                                                                'rating',
                                                            )}
                                                        </button>
                                                    </th>

                                                    <th className="px-5 py-4 text-sm font-semibold text-[#3157D5]">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleSort(
                                                                    'ratedAt',
                                                                )
                                                            }
                                                            className="flex items-center gap-2 hover:text-[#2849B8]"
                                                        >
                                                            Rated On
                                                            {getSortIcon(
                                                                'ratedAt',
                                                            )}
                                                        </button>
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-[#EEF1F5]">
                                                {sortedRatings.map(
                                                    (item) => (
                                                        <tr
                                                            key={
                                                                item.ratingId
                                                            }
                                                            className="hover:bg-[#F8FAFC]"
                                                        >
                                                            <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                                {
                                                                    item.user
                                                                        .name
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                                {
                                                                    item.user
                                                                        .email
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                                {
                                                                    item.user
                                                                        .address
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Star
                                                                        size={
                                                                            17
                                                                        }
                                                                        className="fill-yellow-400 text-yellow-400"
                                                                    />

                                                                    <span className="font-medium text-slate-800">
                                                                        {
                                                                            item.rating
                                                                        }
                                                                    </span>

                                                                    <span className="text-sm text-slate-500">
                                                                        /5
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                                {new Date(
                                                                    item.ratedAt,
                                                                ).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </main>
        </div>
    );
}