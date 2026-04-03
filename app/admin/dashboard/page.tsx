'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import LogoutModal from './components/LogoutModal';
import BookList from './components/BookList';
import AddBook from './components/AddBook';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#F8F9FB] antialiased text-slate-900 font-sans">

            {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenLogout={() => setShowLogoutModal(true)}
            />

            <main className="flex-1 p-10 overflow-y-auto">
                <header className="mb-10 flex justify-between items-start">
                    <div>
                        <p className="text-blue-600 font-bold text-[11px] uppercase tracking-[0.2em] mb-1">Quản lý kho</p>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                            {activeTab === 'list' ? 'Danh sách sách hiện có' : 'Tải lên tài liệu PDF mới'}
                        </h2>
                    </div>
                </header>

                {/* Gọi Component Tương Ứng */}
                {activeTab === 'list' && <BookList />}

                {/* Khi AddBook xong, tự chuyển về tab list */}
                {activeTab === 'add' && <AddBook onSuccess={() => setActiveTab('list')} />}

            </main>
        </div>
    );
}