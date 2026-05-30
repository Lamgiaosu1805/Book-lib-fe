'use client';

import { useState, useEffect, Suspense } from 'react';
import api, { BASE_URL } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const Cross = ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
        <rect x="13" y="2" width="6" height="28" rx="2"/>
        <rect x="4" y="10" width="24" height="6" rx="2"/>
    </svg>
);

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
        setLoading(true); setErrorMsg('');
        try {
            const res = await api.post('/user/login', { email, password });
            document.cookie = `user_token=${res.data.data.accessToken}; path=/; max-age=604800; samesite=lax`;
            router.push('/home');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex" style={{ background: '#F9F5EE' }}>
            {/* Panel trái */}
            <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
                 style={{ background: '#3B0E1E' }}>
                {/* Hoa văn góc */}
                <div className="absolute top-0 left-0 w-48 h-48 opacity-10"
                     style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)' }}/>
                <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10"
                     style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)' }}/>
                {/* Đường viền vàng trái */}
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(to bottom, transparent, #C9A227, transparent)' }}/>

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                             style={{ borderColor: '#C9A227', color: '#C9A227' }}>
                            <Cross size={18}/>
                        </div>
                        <div>
                            <p className="font-black text-white text-base tracking-wide leading-none">Thư Viện Công Giáo</p>
                            <p className="text-xs mt-0.5" style={{ color: '#C9A227' }}>Bibliotheca Catholica</p>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-white leading-snug mb-4">
                        Kho tàng tri thức<br/>
                        <span style={{ color: '#C9A227' }}>đức tin & học thuật</span>
                    </h1>
                    <p className="text-sm leading-relaxed mb-8" style={{ color: '#d4a0a8' }}>
                        Tiếp cận kho tài liệu phong phú của Giáo Hội — từ Kinh Thánh, thần học đến văn học Công giáo.
                    </p>

                    {/* Quote */}
                    <div className="border-l-2 pl-4 py-1" style={{ borderColor: '#C9A227' }}>
                        <p className="text-white italic text-sm leading-relaxed">
                            "Sự thật sẽ giải phóng anh em."
                        </p>
                        <p className="text-xs mt-1 font-semibold" style={{ color: '#C9A227' }}>— Ga 8,32</p>
                    </div>
                </div>

                {/* Ornament dưới */}
                <div className="relative z-10 text-center">
                    <div className="flex items-center gap-3 justify-center" style={{ color: '#C9A227' }}>
                        <span className="text-xs">✦</span>
                        <Cross size={14}/>
                        <span className="text-xs">✦</span>
                    </div>
                    <p className="text-xs mt-3" style={{ color: '#7a3a46' }}>
                        Gloria Patri et Filio et Spiritui Sancto
                    </p>
                </div>
            </div>

            {/* Panel phải */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <Suspense>
                        <SearchParamsReader onRegistered={() => setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.')}/>
                    </Suspense>

                    {/* Logo mobile */}
                    <div className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                             style={{ borderColor: '#3B0E1E', color: '#3B0E1E' }}>
                            <Cross size={14}/>
                        </div>
                        <span className="font-black text-base" style={{ color: '#3B0E1E' }}>Thư Viện Công Giáo</span>
                    </div>

                    {successMsg && (
                        <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                             style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' }}>
                            ✓ {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                             style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239' }}>
                            ✕ {errorMsg}
                        </div>
                    )}

                    <h2 className="text-2xl font-black mb-1" style={{ color: '#3B0E1E' }}>Đăng nhập</h2>
                    <p className="text-sm mb-7" style={{ color: '#9a7070' }}>Chào mừng trở lại thư viện</p>

                    {/* Divider ornament */}
                    <div className="flex items-center gap-2 mb-7">
                        <div className="flex-1 h-px" style={{ background: '#E5D5B5' }}/>
                        <span style={{ color: '#C9A227', fontSize: 10 }}>✦</span>
                        <div className="flex-1 h-px" style={{ background: '#E5D5B5' }}/>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                                   style={{ color: '#7a3a46' }}>Địa chỉ Email</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm"
                                style={{ border: '1.5px solid #E5D5B5', background: '#FFFDF8', color: '#3B0E1E' }}
                                onFocus={e => { e.target.style.borderColor = '#C9A227'; e.target.style.boxShadow = '0 0 0 3px rgba(201,162,39,0.15)'; }}
                                onBlur={e => { e.target.style.borderColor = '#E5D5B5'; e.target.style.boxShadow = 'none'; }}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                                   style={{ color: '#7a3a46' }}>Mật khẩu</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required value={password}
                                    onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all text-sm"
                                    style={{ border: '1.5px solid #E5D5B5', background: '#FFFDF8', color: '#3B0E1E' }}
                                    onFocus={e => { e.target.style.borderColor = '#C9A227'; e.target.style.boxShadow = '0 0 0 3px rgba(201,162,39,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#E5D5B5'; e.target.style.boxShadow = 'none'; }}/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: '#b08080' }}>
                                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-[0.98] mt-2 text-sm"
                            style={{ background: loading ? '#9a4a5a' : '#3B0E1E', boxShadow: '0 4px 15px rgba(59,14,30,0.3)' }}>
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>

                        <div className="flex items-center gap-3 my-2">
                            <div className="flex-1 h-px" style={{ background: '#E5D5B5' }}/>
                            <span className="text-xs font-medium" style={{ color: '#b08080' }}>hoặc</span>
                            <div className="flex-1 h-px" style={{ background: '#E5D5B5' }}/>
                        </div>

                        <button type="button" onClick={() => window.location.href = `${BASE_URL}/auth/google`}
                            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all"
                            style={{ border: '1.5px solid #E5D5B5', background: '#FFFDF8', color: '#3B0E1E' }}>
                            <svg className="w-4 h-4" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                            Đăng nhập bằng Google
                        </button>

                        <p className="text-center text-sm pt-1" style={{ color: '#9a7070' }}>
                            Chưa có tài khoản?{' '}
                            <Link href="/register" className="font-bold hover:underline" style={{ color: '#3B0E1E' }}>
                                Đăng ký ngay
                            </Link>
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
