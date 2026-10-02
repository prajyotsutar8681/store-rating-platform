import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    ArrowUpDown,
    KeyRound,
    LogOut,
    Plus,
    Search,
    X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Role = 'ADMIN' | 'USER' | 'STORE_OWNER';

type User = {
    id: number;
    name: string;
    email: string;
    address: string;
    role: Role;
    createdAt: string;
};

type UserDetails = User & {
    store: {
        id: number;
        name: string;
        email: string;
        address: string;
        rating: number;
    } | null;
};

export default function AdminUsers() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [sortBy, setSortBy] = useState<
        'name' | 'email' | 'address' | 'role' | 'createdAt'
    >('name');
    const [sortOrder, setSortOrder] =
        useState<'asc' | 'desc'>('asc');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showAddForm, setShowAddForm] = useState(false);

    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<Role>('USER');

    const [creating, setCreating] = useState(false);

    const [selectedUser, setSelectedUser] =
        useState<UserDetails | null>(null);
    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/admin/users', {
                params: {
                    search: search || undefined,
                    role: role || undefined,
                    sortBy,
                    sortOrder,
                    page,
                    limit: 10,
                },
            });

            setUsers(response.data.data);
            setTotalPages(
                response.data.pagination.totalPages,
            );
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Unable to load users.';

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
        loadUsers();
    }, [search, role, sortBy, sortOrder, page]);

    const handleSort = (
        field:
            | 'name'
            | 'email'
            | 'address'
            | 'role'
            | 'createdAt',
    ) => {
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

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleRoleChange = (value: string) => {
        setRole(value);
        setPage(1);
    };

    const handleCreateUser = async (
        event: React.FormEvent,
    ) => {
        event.preventDefault();

        try {
            setCreating(true);
            setError('');

            await api.post('/admin/users', {
                name: newName.trim(),
                email: newEmail.trim(),
                address: newAddress.trim(),
                password: newPassword,
                role: newRole,
            });

            setNewName('');
            setNewEmail('');
            setNewAddress('');
            setNewPassword('');
            setNewRole('USER');

            setShowAddForm(false);

            await loadUsers();
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Unable to create user.';

            setError(
                Array.isArray(message)
                    ? message.join(', ')
                    : message,
            );
        } finally {
            setCreating(false);
        }
    };

    const handleViewDetails = async (id: number) => {
        try {
            setDetailsLoading(true);
            setError('');

            const response = await api.get(
                `/admin/users/${id}`,
            );

            setSelectedUser(response.data);
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Unable to load user details.';

            setError(
                Array.isArray(message)
                    ? message.join(', ')
                    : message,
            );
        } finally {
            setDetailsLoading(false);
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
                                Manage Users
                            </h1>

                            <p className="text-sm text-slate-500">
                                View and manage platform users
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
                            Users
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Search, filter and manage registered
                            users.
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
                        Add user
                    </button>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {showAddForm && (
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Add new user
                            </h3>

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
                            onSubmit={handleCreateUser}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Name
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
                                    Email
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
                                    placeholder="user@example.com"
                                    className="w-full rounded-lg border border-[#D8DEE8] px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(
                                            event.target.value,
                                        )
                                    }
                                    minLength={8}
                                    maxLength={16}
                                    required
                                    placeholder="Password"
                                    className="w-full rounded-lg border border-[#D8DEE8] px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Role
                                </label>

                                <select
                                    value={newRole}
                                    onChange={(event) =>
                                        setNewRole(
                                            event.target
                                                .value as Role,
                                        )
                                    }
                                    className="w-full rounded-lg border border-[#D8DEE8] bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="USER">
                                        Normal User
                                    </option>

                                    <option value="ADMIN">
                                        Administrator
                                    </option>

                                    <option value="STORE_OWNER">
                                        Store Owner
                                    </option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Address
                                </label>

                                <textarea
                                    value={newAddress}
                                    onChange={(event) =>
                                        setNewAddress(
                                            event.target.value,
                                        )
                                    }
                                    maxLength={400}
                                    rows={3}
                                    required
                                    placeholder="Enter address"
                                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {creating
                                        ? 'Creating...'
                                        : 'Create user'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mb-5 rounded-xl border border-[#E3E7EE] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
                    <div className="grid gap-3 md:grid-cols-[1fr_200px]">
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
                                placeholder="Search by name, email or address..."
                                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <select
                            value={role}
                            onChange={(event) =>
                                handleRoleChange(
                                    event.target.value,
                                )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All roles</option>
                            <option value="USER">
                                Normal User
                            </option>
                            <option value="ADMIN">
                                Administrator
                            </option>
                            <option value="STORE_OWNER">
                                Store Owner
                            </option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                        Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                        No users found.
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
                                                Name
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
                                                        'role',
                                                    )
                                                }
                                                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                                            >
                                                Role
                                                <ArrowUpDown
                                                    size={15}
                                                />
                                            </button>
                                        </th>

                                        <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                                            Details
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition-colors hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                {user.name}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {user.email}
                                            </td>

                                            <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                                                {user.address}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.role === 'ADMIN'
                                                            ? 'bg-[#EEF3FF] text-[#3157D5]'
                                                            : user.role === 'STORE_OWNER'
                                                                ? 'bg-[#F1F5F9] text-[#475569]'
                                                                : 'bg-[#F4F5F7] text-[#475569]'
                                                        }`}
                                                >
                                                    {user.role ===
                                                        'STORE_OWNER'
                                                        ? 'Store Owner'
                                                        : user.role ===
                                                            'ADMIN'
                                                            ? 'Administrator'
                                                            : 'Normal User'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            user.id,
                                                        )
                                                    }
                                                    className="text-sm font-medium text-[#3157D5] hover:text-[#2849B8]"
                                                >
                                                    View
                                                </button>
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

            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                                User Details
                            </h3>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedUser(null)
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {detailsLoading ? (
                            <p className="text-slate-500">
                                Loading...
                            </p>
                        ) : (
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-slate-500">
                                        Name
                                    </p>
                                    <p className="font-medium text-slate-900">
                                        {selectedUser.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-slate-500">
                                        Email
                                    </p>
                                    <p className="font-medium text-slate-900">
                                        {selectedUser.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-slate-500">
                                        Address
                                    </p>
                                    <p className="font-medium text-slate-900">
                                        {selectedUser.address}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-slate-500">
                                        Role
                                    </p>
                                    <p className="font-medium text-slate-900">
                                        {selectedUser.role}
                                    </p>
                                </div>

                                {selectedUser.store && (
                                    <div className="rounded-lg bg-slate-50 p-4">
                                        <p className="mb-2 font-semibold text-slate-900">
                                            Owned Store
                                        </p>

                                        <p className="text-slate-700">
                                            {
                                                selectedUser
                                                    .store
                                                    .name
                                            }
                                        </p>

                                        <p className="text-slate-500">
                                            {
                                                selectedUser
                                                    .store
                                                    .address
                                            }
                                        </p>

                                        <p className="mt-2 font-medium text-slate-700">
                                            Rating:{' '}
                                            {
                                                selectedUser
                                                    .store
                                                    .rating
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}