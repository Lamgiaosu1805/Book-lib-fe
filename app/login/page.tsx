'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function UserLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:3000/user/login', {
                email,
                password,
            });

            const token = res.data.data.accessToken;

            // ✅ lưu cookie
            document.cookie = `token=${token}; path=/; max-age=604800`;

            router.push('/home');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Login lỗi');
        }
    };

    return (
        <div style={{ padding: 50 }}>
            <h1>User Login</h1>

            <input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <br /><br />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />

            <button onClick={handleLogin}>Login</button>
        </div>
    );
}