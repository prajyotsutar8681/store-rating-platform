import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';

export default function ChangePassword() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }

        if (
            newPassword.length < 8 ||
            newPassword.length > 16
        ) {
            setError('Password must be between 8 and 16 characters.');
            return;
        }

        if (
            !/[A-Z]/.test(newPassword) ||
            !/[^A-Za-z0-9]/.test(newPassword)
        ) {
            setError(
                'New password must contain at least one uppercase letter and one special character.',
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.patch(
                '/auth/change-password',
                {
                    currentPassword,
                    newPassword,
                },
            );

            setSuccess(
                response.data?.message ||
                'Password changed successfully.',
            );

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                'Unable to change password.';

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
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mr-4 rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Change Password
                        </h1>

                        <p className="text-sm text-slate-500">
                            Update your account password
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-xl px-6 py-10">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-lg bg-slate-100 p-3">
                            <KeyRound
                                size={22}
                                className="text-slate-700"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Update your password
                            </h2>

                            <p className="text-sm text-slate-500">
                                Use a password between 8 and 16
                                characters.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Current password
                            </label>

                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(event) =>
                                    setCurrentPassword(
                                        event.target.value,
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                New password
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
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                Must contain at least one uppercase
                                letter and one special character.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Confirm new password
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
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? 'Changing password...'
                                : 'Change password'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}