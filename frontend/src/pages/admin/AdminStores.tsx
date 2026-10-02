import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    ArrowUpDown,
    Building2,
    KeyRound,
    LogOut,
    Plus,
    Search,
    X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Store = {
    id: number;
    name: string;
    email: string;
    address: string;
    rating: number;
};

type StoreOwner = {
    id: number;
    name: string;
    email: string;
};

type SortField =
    | 'name'
    | 'email'
    | 'address'
    | 'rating'
    | 'createdAt';

export default function AdminStores() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [stores, setStores] = useState<Store[]>([]);
    const [owners, setOwners] = useState<StoreOwner[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] =
        useState<SortField>('name');
    const [sortOrder, setSortOrder] =
        useState<'asc' | 'desc'>('asc');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showAddForm, setShowAddForm] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [ownerId, setOwnerId] = useState('');

    const loadStores = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/admin/stores', {
                params: {
                    search: search || undefined,
                    sortBy,
                    sortOrder,
                    page,
                    limit: 10,
                },
            });

            setStores(response.data.data);
            setTotalPages(
                response.data.pagination.totalPages,
            );
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

    const loadOwners = async () => {
        try {
            const response = await api.get('/admin/users', {
                params: {
                    role: 'STORE_OWNER',
                    page: 1,
                    limit: 100,
                    sortBy: 'name',
                    sortOrder: 'asc',
                },
            });

            setOwners(response.data.data);
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Unable to load store owners.';

            setError(
                Array.isArray(message)
                    ? message.join(', ')
                    : message,
            );
        }
    };

    useEffect(() => {
        loadStores();
    }, [search, sortBy, sortOrder, page]);

    useEffect(() => {
        loadOwners();
    }, []);

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

    const handleCreateStore = async (
        event: React.FormEvent,
    ) => {
        event.preventDefault();

        if (!ownerId) {
            setError('Please select a store owner.');
            return;
        }

        try {
            setCreating(true);
            setError('');

            await api.post('/admin/stores', {
                name: newName.trim(),
                email: newEmail.trim(),
                address: newAddress.trim(),
                ownerId: Number(ownerId),
            });

            setNewName('');
            setNewEmail('');
            setNewAddress('');
            setOwnerId('');
            setShowAddForm(false);

            await loadStores();
            await loadOwners();
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Unable to create store.';

            setError(
                Array.isArray(message)
                    ? message.join(', ')
                    : message,
            );
        } finally {
            setCreating(false);
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
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                navigate('/admin/dashboard')
                            }
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Manage Stores
                            </h1>

                            <p className="text-sm text-slate-500">
                                View and manage platform stores
                            </p>
                        </div>
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
                            className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Stores
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage stores and their owners.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setShowAddForm(!showAddForm)
                        }
                        className="flex items-center gap-2 rounded-lg bg-[#3157D5] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2849B8]"
                    >
                        <Plus size={17} />
                        Add store
                    </button>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {showAddForm && (
                    <div className="mb-6 rounded-xl border border-[#E3E7EE] bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Add new store
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Assign an existing store owner
                                    to this store.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowAddForm(false)
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateStore}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Store name
                                </label>

                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(event) =>
                                        setNewName(
                                            event.target.value,
                                        )
                                    }
                                    minLength={20}
                                    maxLength={60}
                                    required
                                    placeholder="20–60 characters"
                                    className="w-full rounded-lg border border-[#D8DEE8] px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Store email
                                </label>

                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(event) =>
                                        setNewEmail(
                                            event.target.value,
                                        )
                                    }
                                    required
                                    placeholder="store@example.com"
                                    className="w-full rounded-lg border border-[#D8DEE8] px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Store owner
                                </label>

                                <select
                                    value={ownerId}
                                    onChange={(event) =>
                                        setOwnerId(
                                            event.target.value,
                                        )
                                    }
                                    required
                                    className="w-full rounded-lg border border-[#D8DEE8] bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Select store owner
                                    </option>

                                    {owners.map((owner) => (
                                        <option
                                            key={owner.id}
                                            value={owner.id}
                                        >
                                            {owner.name} —{' '}
                                            {owner.email}
                                        </option>
                                    ))}
                                </select>

                                {owners.length === 0 && (
                                    <p className="mt-1 text-xs text-amber-600">
                                        No store owners available.
                                        Create a STORE_OWNER user
                                        first.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Address
                                </label>

                                <input
                                    type="text"
                                    value={newAddress}
                                    onChange={(event) =>
                                        setNewAddress(
                                            event.target.value,
                                        )
                                    }
                                    maxLength={400}
                                    required
                                    placeholder="Store address"
                                    className="w-full rounded-lg border border-[#D8DEE8] px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={
                                        creating ||
                                        owners.length === 0
                                    }
                                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {creating
                                        ? 'Creating...'
                                        : 'Create store'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mb-5 rounded-xl border border-[#E3E7EE] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                handleSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Search by store name, email or address..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    {(
                        [
                            ['name', 'Name'],
                            ['email', 'Email'],
                            ['address', 'Address'],
                            ['rating', 'Rating'],
                        ] as [SortField, string][]
                    ).map(([field, label]) => (
                        <button
                            key={field}
                            type="button"
                            onClick={() =>
                                handleSort(field)
                            }
                            className="flex items-center gap-2 rounded-lg border border-[#D8DEE8] bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F8FAFC]"
                        >
                            {label}
                            <ArrowUpDown size={15} />
                        </button>
                    ))}
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
                                        <th className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSort(
                                                        'name',
                                                    )
                                                }
                                                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                                            >
                                                Store Name
                                                <ArrowUpDown
                                                    size={15}
                                                />
                                            </button>
                                        </th>

                                        <th className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSort(
                                                        'email',
                                                    )
                                                }
                                                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                                            >
                                                Email
                                                <ArrowUpDown
                                                    size={15}
                                                />
                                            </button>
                                        </th>

                                        <th className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSort(
                                                        'address',
                                                    )
                                                }
                                                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                                            >
                                                Address
                                                <ArrowUpDown
                                                    size={15}
                                                />
                                            </button>
                                        </th>

                                        <th className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSort(
                                                        'rating',
                                                    )
                                                }
                                                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                                            >
                                                Rating
                                                <ArrowUpDown
                                                    size={15}
                                                />
                                            </button>
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
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-[#F4F5F7] p-2">
                                                        <Building2
                                                            size={18}
                                                            className="text-[#475569]"
                                                        />
                                                    </div>

                                                    <span className="font-medium text-slate-900">
                                                        {
                                                            store.name
                                                        }
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-5 text-sm text-slate-600">
                                                {store.email}
                                            </td>

                                            <td className="px-5 py-5 text-sm text-slate-600">
                                                {store.address}
                                            </td>

                                            <td className="px-5 py-5">
                                                <span className="font-medium text-slate-900">
                                                    {Number(
                                                        store.rating,
                                                    ).toFixed(2)}
                                                </span>
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
                                setPage(
                                    (current) =>
                                        current - 1,
                                )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
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
                                setPage(
                                    (current) =>
                                        current + 1,
                                )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}