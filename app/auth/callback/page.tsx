'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            document.cookie = `user_token=${token}; path=/; max-age=604800; samesite=lax`;
            router.replace('/home');
        } else {
            router.replace('/login?error=1');
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB] gap-4">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Đang xác thực...</p>
        </div>
    );
}
