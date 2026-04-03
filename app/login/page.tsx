'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3000/user/login', {
                email,
                password,
            });

            const token = res.data.data.accessToken;
            document.cookie = `token=${token}; path=/; max-age=604800; samesite=lax`;

            router.push('/home');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-blue-500 via-indigo-500 to-purple-600 p-4">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10">
                <div className="text-center mb-10">
                    <div className="inline-block p-3 rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800">Xin chào!</h2>
                    <p className="text-gray-500 mt-2 font-medium">Đăng nhập tài khoản để tiếp tục</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 placeholder:opacity-100 bg-gray-50/50"
                            placeholder="ban-la-ai@gmail.com"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="text-sm font-semibold text-gray-700">Mật khẩu</label>
                            <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Quên mật khẩu?</a>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 placeholder:opacity-100 bg-gray-50/50"
                            placeholder="Nhập mật khẩu của bạn"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.97] ${loading
                            ? 'bg-indigo-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'
                            }`}
                    >
                        {loading ? 'Đang kết nối...' : 'Đăng nhập'}
                    </button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-semibold">Hoặc tiếp tục với</span></div>
                    </div>

                    <p className="text-center text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                            Tạo tài khoản mới
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}