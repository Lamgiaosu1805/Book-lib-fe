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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl border border-slate-100 text-center">
                <div className="flex justify-center text-amber-500 mb-4"><AlertTriangle size={40} /></div>
                <h3 className="text-lg font-bold">Xác nhận đăng xuất?</h3>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Hủy</button>
                    <button onClick={handleLogout} className="flex-1 py-2.5 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-all">Đăng xuất</button>
                </div>
            </div>
        </div>
    );
}