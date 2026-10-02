import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);

            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (user.role === 'STORE_OWNER') {
                navigate('/owner/dashboard');
            } else {
                navigate('/stores');
            }
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Unable to login. Please check your credentials.';

            setError(
                Array.isArray(message)
                    ? message.join(', ')
                    : message,
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex min-h-screen items-center justify-center px-6 py-10">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900">
                            Store Rating Platform
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Sign in to continue
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        {error && (
                            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Email
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder="Enter your email"
                                        required
                                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter your password"
                                        required
                                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-11 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword,
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? 'Signing in...'
                                    : 'Sign in'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-medium text-slate-900 hover:underline"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}