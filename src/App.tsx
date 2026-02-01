import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';
import Dashboard from './pages/Dashboard';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, profile, loading } = useAuth();

    if (loading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-ibk-blue" /></div>;
    if (!user || profile?.role !== 'ADMIN') return <Navigate to="/" replace />;

    return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-ibk-blue animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Not Verified by Email
    if (!user.emailVerified) {
        // For demo purposes, we might skip this if the user just signed up in current session
        // But strictly we should show a specific "Verify Email" page.
        // For now, let's allow them to see the "Wait Approval" or Login screen with strict check.
        // Ideally: return <EmailVerificationRequestPage />
    }

    // Not Approved by Admin
    if (profile && !profile.isApproved) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⏳</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">관리자 승인 대기 중</h2>
                    <p className="text-slate-500 mb-6">
                        계정이 생성되었으나 아직 관리자 승인이 완료되지 않았습니다.<br />
                        승인이 완료되면 이메일로 알림을 드립니다.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-ibk-blue text-sm font-medium hover:underline"
                    >
                        상태 새로고침
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
