'use client';

import { useState, useEffect, Suspense } from 'react';
import api, { BASE_URL } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SearchParamsReader({ onRegistered }: { onRegistered: () => void }) {
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams.get('registered') === '1') onRegistered();
    }, [searchParams]);
    return null;
}

function UserLoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(''); // Reset lỗi trước khi gọi API

        try {
            const res = await api.post('/user/login', {
                email,
                password,
            });

            const token = res.data.data.accessToken;
            // ✅ ĐÃ SỬA: Lưu cookie với tên 'user_token' thay vì 'token'
            document.cookie = `user_token=${token}; path=/; max-age=604800; samesite=lax`;

            router.push('/home');
        } catch (err: any) {
            // ✅ Thay vì alert, ta set thông báo lỗi vào state
            setErrorMsg(err.response?.data?.message || 'Email hoặc mật khẩu không đúng. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-blue-500 via-indigo-500 to-purple-600 p-4">
            <Suspense>
                <SearchParamsReader onRegistered={() => setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.')} />
            </Suspense>

            {successMsg && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg font-bold text-sm animate-in slide-in-from-top-4">
                    {successMsg}
                </div>
            )}

            {/* ✅ MODAL HIỂN THỊ LỖI */}
            {errorMsg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-[24px] p-6 md:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            {/* Icon Cảnh báo */}
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 border-[6px] border-red-50/50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-extrabold text-gray-800 mb-2">Đăng nhập thất bại</h3>
                            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                                {errorMsg}
                            </p>

                            <button
                                onClick={() => setErrorMsg('')}
                                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold transition-all active:scale-[0.97]"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FORM ĐĂNG NHẬP */}
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
                            className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 placeholder:opacity-100 bg-gray-50/50 text-gray-900 font-medium"
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
                            className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 placeholder:opacity-100 bg-gray-50/50 text-gray-900 font-medium"
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

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-semibold">Hoặc</span></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.location.href = `${BASE_URL}/auth/google`}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-bold text-gray-700 transition-all active:scale-[0.97]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Đăng nhập bằng Google
                    </button>

                    <p className="text-center text-gray-600 pt-2">
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

export default function UserLogin() {
    return (
        <Suspense>
            <UserLoginContent />
        </Suspense>
    );
}