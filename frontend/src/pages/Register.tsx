import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        setError('');
        setSuccess('');

        if (name.trim().length < 20) {
            setError('Name must be at least 20 characters long.');
            return;
        }

        if (name.trim().length > 60) {
            setError('Name cannot exceed 60 characters.');
            return;
        }

        if (address.trim().length > 400) {
            setError('Address cannot exceed 400 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Password and confirm password do not match.');
            return;
        }

        try {
            setLoading(true);

            await register(
                name.trim(),
                email.trim(),
                address.trim(),
                password,
            );

            setSuccess(
                'Registration successful. You can now login.',
            );

            setName('');
            setEmail('');
            setAddress('');
            setPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                navigate('/login');
            }, 1200);
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Unable to create account.';

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
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
                        <UserPlus
                            size={22}
                            className="text-white"
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Create your account
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Register as a normal user to rate stores.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Full name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Enter your full name"
                                minLength={20}
                                maxLength={60}
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                20–60 characters
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Address
                            </label>

                            <textarea
                                value={address}
                                onChange={(event) =>
                                    setAddress(event.target.value)
                                }
                                placeholder="Enter your address"
                                maxLength={400}
                                rows={3}
                                required
                                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                Maximum 400 characters
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                minLength={8}
                                maxLength={16}
                                required
                                placeholder="Create a password"
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                8–16 characters, with at least one
                                uppercase letter and one special
                                character.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Confirm password
                            </label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value,
                                    )
                                }
                                minLength={8}
                                maxLength={16}
                                required
                                placeholder="Confirm your password"
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? 'Creating account...'
                                : 'Create account'}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-slate-900 hover:underline"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}