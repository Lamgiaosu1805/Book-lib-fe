'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:3000/admin/login', {
                email,
                password,
            });

            const token = res.data.data.accessToken;
            document.cookie = `token=${token}; path=/; max-age=604800; samesite=lax`;
            router.push('/admin/dashboard');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi đăng nhập hệ thống');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border border-gray-200">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Panel</h1>
                    <p className="text-gray-500 mt-2">Quản lý hệ thống nội bộ</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 placeholder:opacity-100 bg-white text-gray-900"
                            placeholder="admin@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500 placeholder:opacity-100 bg-white text-gray-900"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-lg font-bold text-white shadow-md transition-all active:scale-[0.98] ${loading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                            }`}
                    >
                        {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP ADMIN'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-10 uppercase tracking-widest font-medium">
                    &copy; 2026 Admin Dashboard System
                </p>
            </div>
        </div>
    );
}