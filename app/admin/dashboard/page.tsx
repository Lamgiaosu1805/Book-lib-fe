'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import LogoutModal from './components/LogoutModal';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import CategoryList from './components/CategoryList';
import UserManagement from './components/UserManagement';

const tabTitles = {
    list:       { title: 'Danh sách tài liệu',    sub: 'Quản lý toàn bộ sách và tài liệu trong hệ thống' },
    add:        { title: 'Thêm tài liệu mới',      sub: 'Tải lên và cấu hình sách PDF mới'               },
    categories: { title: 'Quản lý danh mục',       sub: 'Phân loại và tổ chức tài liệu theo chủ đề'      },
    users:      { title: 'Quản lý người dùng',     sub: 'Xem và quản lý tài khoản thành viên hệ thống'   },
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'list' | 'add' | 'categories' | 'users'>('list');
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const { title, sub } = tabTitles[activeTab];

    return (
        <div className="flex min-h-screen bg-stone-50 antialiased font-sans">
            {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenLogout={() => setShowLogoutModal(true)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Page header */}
                <div className="bg-white border-b border-stone-100 px-8 py-5 sticky top-0 z-30">
                    <h1 className="text-xl font-black text-stone-800">{title}</h1>
                    <p className="text-stone-400 text-sm mt-0.5">{sub}</p>
                </div>

                <main className="flex-1 p-8">
                    {activeTab === 'list'       && <BookList />}
                    {activeTab === 'add'        && <AddBook onSuccess={() => setActiveTab('list')} />}
                    {activeTab === 'categories' && <CategoryList />}
                    {activeTab === 'users'      && <UserManagement />}
                </main>
            </div>
        </div>
    );
}
