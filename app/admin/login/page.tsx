'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:3000/admin/login', {
                email,
                password,
            });

            const token = res.data.data.accessToken;

            // ✅ lưu cookie
            document.cookie = `token=${token}; path=/; max-age=604800`;

            router.push('/admin/dashboard');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi đăng nhập');
        }
    };

    return (
        <div style={{ padding: 50 }}>
            <h1>Admin Login</h1>

            <input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>Login</button>
        </div>
    );
}