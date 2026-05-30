'use client';

import { useState, useEffect, Suspense } from 'react';
import api, { BASE_URL } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

function SearchParamsReader({ onRegistered }: { onRegistered: () => void }) {
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams.get('registered') === '1') onRegistered();
    }, [searchParams]);
    return null;
}

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await api.post('/user/login', { email, password });
            const token = res.data.data.accessToken;
            document.cookie = `user_token=${token}; path=/; max-age=604800; samesite=lax`;
            router.push('/home');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-stone-50">
            {/* Panel trái */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1a2e4a] flex-col justify-between p-12 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full" />
                <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-amber-500/5 rounded-full" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen size={22} className="text-white" />
                        </div>
                        <span className="text-white font-black text-xl tracking-tight">E-Library</span>
                    </div>
                    <h1 className="text-4xl font-black text-white leading-tight mb-4">
                        Thư viện điện tử<br />
                        <span className="text-amber-400">trong tầm tay bạn</span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Khám phá kho tàng tri thức với hàng nghìn đầu sách, tài liệu được số hóa và lưu trữ an toàn.
                    </p>
                </div>

                {/* Bookshelf decoration */}
                <div className="relative z-10 grid grid-cols-5 gap-2 mt-8">
                    {['bg-amber-600','bg-blue-700','bg-emerald-700','bg-rose-800','bg-violet-700',
                      'bg-teal-700','bg-amber-700','bg-indigo-700','bg-red-800','bg-slate-600'].map((c,i) => (
                        <div key={i} className={`${c} rounded-t-sm h-${[20,24,18,22,20,24,18,20,22,16][i]} opacity-80`}
                             style={{height: [80,96,72,88,80,96,72,80,88,64][i]}} />
                    ))}
                </div>

                <p className="relative z-10 text-slate-500 text-sm italic mt-6">
                    "Sách là người bạn đồng hành trung thành nhất của con người"
                </p>
            </div>

            {/* Panel phải */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <Suspense>
                        <SearchParamsReader onRegistered={() => setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.')} />
                    </Suspense>

                    {successMsg && (
                        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl font-medium text-sm">
                            <span>✓</span> {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-medium text-sm">
                            <span>✕</span> {errorMsg}
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-stone-800 mb-2">Đăng nhập</h2>
                        <p className="text-stone-400">Chào mừng trở lại thư viện</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-stone-600 mb-2">Địa chỉ email</label>
                            <input
                                type="email" required value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white focus:ring-4 focus:ring-amber-100 focus:border-amber-400 outline-none transition-all text-stone-800 placeholder:text-stone-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-600 mb-2">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'} required value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-stone-200 bg-white focus:ring-4 focus:ring-amber-100 focus:border-amber-400 outline-none transition-all text-stone-800 placeholder:text-stone-300"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] ${loading ? 'bg-amber-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200'}`}>
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200"/></div>
                            <div className="relative flex justify-center"><span className="bg-stone-50 px-3 text-xs text-stone-400 font-medium uppercase tracking-wider">Hoặc tiếp tục với</span></div>
                        </div>

                        <button type="button" onClick={() => window.location.href = `${BASE_URL}/auth/google`}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 font-semibold text-stone-700 transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            Đăng nhập bằng Google
                        </button>

                        <p className="text-center text-stone-500 text-sm pt-2">
                            Chưa có tài khoản?{' '}
                            <Link href="/register" className="text-amber-600 font-bold hover:text-amber-700">Đăng ký ngay</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function UserLogin() {
    return <Suspense><LoginContent /></Suspense>;
}
