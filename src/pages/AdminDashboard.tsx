import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { type UserProfile } from '../types';
import { ShieldCheck, UserCheck, Loader2 } from 'lucide-react';

export const AdminDashboard = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            // Query users where isApproved == false
            const q = query(collection(db, 'users'), where('isApproved', '==', false));
            const snapshot = await getDocs(q);
            const pendingUsers = snapshot.docs.map(doc => doc.data() as UserProfile);
            setUsers(pendingUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (uid: string) => {
        setProcessing(uid);
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { isApproved: true });
            // Refresh list
            setUsers(prev => prev.filter(u => u.uid !== uid));
        } catch (error) {
            console.error('Error approving user:', error);
            alert('승인 중 오류가 발생했습니다.');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center gap-3 mb-8">
                    <div className="bg-ibk-navy p-3 rounded-lg text-white shadow-lg">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">관리자 페이지</h1>
                        <p className="text-slate-500 text-sm">신규 가입 요청을 승인합니다.</p>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-slate-700">승인 대기 목록</h2>
                        <button
                            onClick={fetchPendingUsers}
                            className="text-xs text-ibk-blue hover:underline"
                        >
                            새로고침
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-10 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            승인 대기 중인 사용자가 없습니다.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {users.map(user => (
                                <div key={user.uid} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                            <UserCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{user.email}</p>
                                            <p className="text-xs text-slate-400">가입일: {new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleApprove(user.uid)}
                                        disabled={!!processing}
                                        className="bg-ibk-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {processing === user.uid ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            '승인하기'
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
