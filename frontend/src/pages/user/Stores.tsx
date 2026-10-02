import { useEffect, useState } from 'react';
import {
    LogOut,
    Search,
    Star,
    ArrowUpDown,
    KeyRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Store = {
    id: number;
    name: string;
    address: string;
    overallRating: number;
    userRating: number | null;
};

type SortField = 'name' | 'address' | 'rating';

export default function Stores() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [stores, setStores] = useState<Store[]>([]);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [ratingLoading, setRatingLoading] = useState<number | null>(
        null,
    );

    const loadStores = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/stores', {
                params: {
                    search: search || undefined,
                    sortBy,
                    sortOrder,
                    page,
                    limit: 10,
                },
            });

            setStores(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Unable to load stores.';

            setError(
                Array.isArray(message)
                    ? message.join(', ')
                    : message,
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStores();
    }, [search, sortBy, sortOrder, page]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortOrder(
                sortOrder === 'asc' ? 'desc' : 'asc',
            );
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }

        setPage(1);
    };

    const handleRating = async (
        storeId: number,
        rating: number,
        hasExistingRating: boolean,
    ) => {
        try {
            setRatingLoading(storeId);
            setError('');

            if (hasExistingRating) {
                await api.patch(`/ratings/${storeId}`, {
                    rating,
                });
            } else {
                await api.post('/ratings', {
                    storeId,
                    rating,
                });
            }

            await loadStores();
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Unable to submit rating.';

            setError(
                Array.isArray(message)
                    ? message.join(', ')
                    : message,
            );
        } finally {
            setRatingLoading(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            <header className="border-b border-[#E6E9EF] bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Store Rating Platform
                        </h1>

                        <p className="text-sm text-slate-500">
                            Welcome, {user?.name}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                navigate('/change-password')
                            }
                            className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <KeyRound size={16} />
                            Change password
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg bg-[#3157D5] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2849B8]"
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
                        Find a Store
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Browse stores and share your experience.
                    </p>
                </div>

                <div className="mb-6 rounded-xl border border-[#E3E7EE] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                handleSearch(event.target.value)
                            }
                            placeholder="Search by store name or address..."
                            className="w-full rounded-lg border border-[#D8DEE8] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mb-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 rounded-lg border border-[#D8DEE8] bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F8FAFC]"
                    >
                        Name
                        <ArrowUpDown size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSort('address')}
                        className="flex items-center gap-2 rounded-lg border border-[#D8DEE8] bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F8FAFC]"
                    >
                        Address
                        <ArrowUpDown size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSort('rating')}
                        className="flex items-center gap-2 rounded-lg border border-[#D8DEE8] bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F8FAFC]"
                    >
                        Rating
                        <ArrowUpDown size={15} />
                    </button>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                        Loading stores...
                    </div>
                ) : stores.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                        No stores found.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-[#E3E7EE] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-[#E3E7EE] bg-[#F8F9FB]">
                                    <tr>
                                        <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                            Store
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                            Address
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                            Overall Rating
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                            Your Rating
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {stores.map((store) => (
                                        <tr
                                            key={store.id}
                                            className="transition-colors hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-5 py-5">
                                                <p className="font-medium text-slate-900">
                                                    {store.name}
                                                </p>
                                            </td>

                                            <td className="px-5 py-5 text-sm text-slate-600">
                                                {store.address}
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex items-center gap-1.5">
                                                    <Star
                                                        size={17}
                                                        className="fill-yellow-400 text-yellow-400"
                                                    />

                                                    <span className="font-medium text-slate-800">
                                                        {store.overallRating.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map(
                                                        (rating) => (
                                                            <button
                                                                key={rating}
                                                                type="button"
                                                                disabled={
                                                                    ratingLoading ===
                                                                    store.id
                                                                }
                                                                onClick={() =>
                                                                    handleRating(
                                                                        store.id,
                                                                        rating,
                                                                        store.userRating !==
                                                                        null,
                                                                    )
                                                                }
                                                                title={`Rate ${rating}`}
                                                                className="disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <Star
                                                                    size={19}
                                                                    className={
                                                                        store.userRating !==
                                                                            null &&
                                                                            rating <=
                                                                            store.userRating
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-slate-300 hover:text-yellow-400'
                                                                    }
                                                                />
                                                            </button>
                                                        ),
                                                    )}
                                                </div>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {store.userRating !== null
                                                        ? `Your rating: ${store.userRating}/5`
                                                        : 'Not rated yet'}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() =>
                                setPage((current) => current - 1)
                            }
                            className="rounded-lg border border-[#D8DEE8] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="text-sm text-slate-500">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={page === totalPages}
                            onClick={() =>
                                setPage((current) => current + 1)
                            }
                            className="rounded-lg border border-[#D8DEE8] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}