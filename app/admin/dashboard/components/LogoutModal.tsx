'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function LogoutModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/admin/login');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0407]/45 backdrop-blur-[2px]">
            <div className="rounded-2xl p-8 max-w-sm w-full shadow-xl text-center"
                 style={{ background: '#FFFDF8', border: '1px solid #E5D5B5' }}>
                <div className="flex justify-center mb-4" style={{ color: '#f59e0b' }}><AlertTriangle size={40} /></div>
                <h3 className="text-lg font-black" style={{ color: '#3B0E1E' }}>Xác nhận đăng xuất?</h3>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl font-bold transition-all"
                        style={{ background: '#F9F5EE', color: '#7a3a46', border: '1px solid #E5D5B5' }}>
                        Hủy
                    </button>
                    <button onClick={handleLogout}
                        className="flex-1 py-2.5 rounded-xl font-bold transition-all"
                        style={{ background: '#7B1A1A', color: '#fee2e2' }}>
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
}
