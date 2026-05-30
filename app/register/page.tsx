'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const Cross = ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
        <rect x="13" y="2" width="6" height="28" rx="2"/>
        <rect x="4" y="10" width="24" height="6" rx="2"/>
    </svg>
);

const inputStyle = { border: '1.5px solid #E5D5B5', background: '#FFFDF8', color: '#3B0E1E' };
const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#C9A227';
    e.target.style.boxShadow = '0 0 0 3px rgba(201,162,39,0.15)';
};
const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#E5D5B5';
    e.target.style.boxShadow = 'none';
};

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
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex" style={{ background: '#F9F5EE' }}>
            {/* Panel trái */}
            <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
                 style={{ background: '#3B0E1E' }}>
                <div className="absolute top-0 left-0 w-48 h-48 opacity-10"
                     style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)' }}/>
                <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10"
                     style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)' }}/>
                <div className="absolute left-0 top-0 bottom-0 w-1"
                     style={{ background: 'linear-gradient(to bottom, transparent, #C9A227, transparent)' }}/>

                <div className="relative z-10">
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
                        Gia nhập cộng đồng<br/>
                        <span style={{ color: '#C9A227' }}>đức tin & tri thức</span>
                    </h1>
                    <p className="text-sm leading-relaxed mb-8" style={{ color: '#d4a0a8' }}>
                        Đăng ký miễn phí để được truy cập vào kho tàng tài liệu Công giáo phong phú và đa dạng.
                    </p>

                    <div className="space-y-4">
                        {[
                            'Hàng nghìn tài liệu thần học, Kinh Thánh',
                            'Đọc online mọi lúc, mọi nơi',
                            'Tủ sách cá nhân tiện lợi',
                        ].map((text, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                     style={{ background: 'rgba(201,162,39,0.2)', border: '1px solid rgba(201,162,39,0.4)' }}>
                                    <span className="text-[10px]" style={{ color: '#C9A227' }}>✓</span>
                                </div>
                                <span className="text-sm" style={{ color: '#d4a0a8' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="border-l-2 pl-4 py-1 mb-6" style={{ borderColor: '#C9A227' }}>
                        <p className="text-white italic text-sm">"Lời Chúa là đèn soi bước chân con."</p>
                        <p className="text-xs mt-1 font-semibold" style={{ color: '#C9A227' }}>— Tv 119,105</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center gap-3 justify-center" style={{ color: '#C9A227' }}>
                            <span className="text-xs">✦</span><Cross size={14}/><span className="text-xs">✦</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel phải */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                             style={{ borderColor: '#3B0E1E', color: '#3B0E1E' }}>
                            <Cross size={14}/>
                        </div>
                        <span className="font-black text-base" style={{ color: '#3B0E1E' }}>Thư Viện Công Giáo</span>
                    </div>

                    {errorMsg && (
                        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                             style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239' }}>
                            ✕ {errorMsg}
                        </div>
                    )}

                    <h2 className="text-2xl font-black mb-1" style={{ color: '#3B0E1E' }}>Tạo tài khoản</h2>
                    <p className="text-sm mb-7" style={{ color: '#9a7070' }}>Miễn phí và chỉ mất vài giây</p>

                    <div className="flex items-center gap-2 mb-7">
                        <div className="flex-1 h-px" style={{ background: '#E5D5B5' }}/>
                        <span style={{ color: '#C9A227', fontSize: 10 }}>✦</span>
                        <div className="flex-1 h-px" style={{ background: '#E5D5B5' }}/>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {[
                            { label: 'Địa chỉ Email', type: 'email', value: email, setter: setEmail, placeholder: 'email@example.com' },
                            { label: 'Xác nhận mật khẩu', type: 'password', value: confirmPassword, setter: setConfirmPassword, placeholder: 'Nhập lại mật khẩu' },
                        ].map(({ label, type, value, setter, placeholder }, i) =>
                            i === 0 ? (
                                <div key={label}>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                                           style={{ color: '#7a3a46' }}>{label}</label>
                                    <input type={type} required value={value} onChange={e => setter(e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm"
                                        style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                                </div>
                            ) : null
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                                   style={{ color: '#7a3a46' }}>Mật khẩu</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required minLength={6}
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all text-sm"
                                    style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#b08080' }}>
                                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                                   style={{ color: '#7a3a46' }}>Xác nhận mật khẩu</label>
                            <input type="password" required value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu"
                                className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm"
                                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}/>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-[0.98] text-sm"
                            style={{ background: loading ? '#9a4a5a' : '#3B0E1E', boxShadow: '0 4px 15px rgba(59,14,30,0.3)' }}>
                            {loading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>

                        <p className="text-center text-sm pt-1" style={{ color: '#9a7070' }}>
                            Đã có tài khoản?{' '}
                            <Link href="/login" className="font-bold hover:underline" style={{ color: '#3B0E1E' }}>
                                Đăng nhập
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
