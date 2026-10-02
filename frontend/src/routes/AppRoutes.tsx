import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext';
import Stores from '../pages/user/Stores';
import ChangePassword from '../pages/ChangePassword';
import Register from '../pages/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminStores from '../pages/admin/AdminStores';
import OwnerDashboard from '../pages/owner/OwnerDashboard';



function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-600">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function RoleRoute({
    role,
    children,
}: {
    role: 'ADMIN' | 'USER' | 'STORE_OWNER';
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleRoute role="ADMIN">
                            <AdminDashboard />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute>
                        <RoleRoute role="ADMIN">
                            <AdminUsers />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/stores"
                element={
                    <ProtectedRoute>
                        <RoleRoute role="ADMIN">
                            <AdminStores />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/stores"
                element={
                    <ProtectedRoute>
                        <RoleRoute role="USER">
                            <Stores />
                        </RoleRoute>
                    </ProtectedRoute>
                }

            />

            <Route
                path="/owner/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleRoute role="STORE_OWNER">
                            <OwnerDashboard />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/change-password"
                element={
                    <ProtectedRoute>
                        <ChangePassword />
                    </ProtectedRoute>
                }
            />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}