'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    const logout = () => {
        document.cookie = "token=; path=/; max-age=0";
        router.push('/login');
    };

    return (
        <div style={{ padding: 50 }}>
            <h1>Trang Home User 🎉</h1>

            <button onClick={logout}>Logout</button>
        </div>
    );
}