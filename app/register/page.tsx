'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) { setErrorMsg('Mật khẩu xác nhận không khớp!'); return; }
        setLoading(true); setErrorMsg('');
        try {
            await api.post('/user/register', { email, password });
            router.push('/login?registered=1');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-stone-50">
            {/* Panel trái */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1a2e4a] flex-col justify-between p-12 relative overflow-hidden">
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
                        Tham gia cộng đồng<br />
                        <span className="text-amber-400">đọc sách trực tuyến</span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Đăng ký miễn phí để truy cập hàng nghìn tài liệu, sách điện tử được tuyển chọn kỹ lưỡng.
                    </p>
                </div>

                <div className="relative z-10 space-y-4">
                    {['Truy cập kho tàng sách điện tử phong phú', 'Lưu sách vào tủ cá nhân', 'Đọc mọi lúc, mọi nơi'].map((text, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-amber-400 text-xs">✓</span>
                            </div>
                            <span className="text-slate-300 text-sm">{text}</span>
                        </div>
                    ))}
                </div>

                <p className="relative z-10 text-slate-500 text-sm italic">
                    "Tri thức là ngọn đèn soi sáng con đường"
                </p>
            </div>

            {/* Panel phải */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {errorMsg && (
                        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-medium text-sm">
                            <span>✕</span> {errorMsg}
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-stone-800 mb-2">Tạo tài khoản</h2>
                        <p className="text-stone-400">Miễn phí và chỉ mất vài giây</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-stone-600 mb-2">Địa chỉ email</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white focus:ring-4 focus:ring-amber-100 focus:border-amber-400 outline-none transition-all text-stone-800 placeholder:text-stone-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-600 mb-2">Mật khẩu</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password}
                                    onChange={e => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự"
                                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-stone-200 bg-white focus:ring-4 focus:ring-amber-100 focus:border-amber-400 outline-none transition-all text-stone-800 placeholder:text-stone-300" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-600 mb-2">Xác nhận mật khẩu</label>
                            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu"
                                className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-white focus:ring-4 focus:ring-amber-100 focus:border-amber-400 outline-none transition-all text-stone-800 placeholder:text-stone-300" />
                        </div>

                        <button type="submit" disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] ${loading ? 'bg-amber-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200'}`}>
                            {loading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>

                        <p className="text-center text-stone-500 text-sm pt-2">
                            Đã có tài khoản?{' '}
                            <Link href="/login" className="text-amber-600 font-bold hover:text-amber-700">Đăng nhập</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
