'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import LogoutModal from './components/LogoutModal';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import CategoryList from './components/CategoryList';
import UserManagement from './components/UserManagement';
import AuditLogList from './components/AuditLogList';
import AdminManagement from './components/AdminManagement';
import AdminPasswordSettings from './components/AdminPasswordSettings';

type Tab = 'list' | 'add' | 'categories' | 'users' | 'logs' | 'admins' | 'account';

const tabConfig: Record<Tab, { title: string; sub: string }> = {
    list:       { title: 'Danh sách tài liệu',   sub: 'Quản lý toàn bộ sách và tài liệu trong hệ thống' },
    add:        { title: 'Thêm tài liệu mới',     sub: 'Tải lên và cấu hình sách PDF mới'               },
    categories: { title: 'Quản lý danh mục',      sub: 'Phân loại và tổ chức tài liệu theo chủ đề'      },
    users:      { title: 'Quản lý người dùng',    sub: 'Xem và quản lý tài khoản thành viên hệ thống'   },
    logs:       { title: 'Nhật ký hoạt động',     sub: 'Theo dõi mọi thao tác của quản trị viên'        },
    admins:     { title: 'Quản trị viên',         sub: 'Cấp tài khoản và quản lý nhóm quản trị viên'    },
    account:    { title: 'Tài khoản',             sub: 'Đổi mật khẩu quản trị viên của bạn'             },
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('list');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { title, sub } = tabConfig[activeTab];

    return (
        <div className="flex min-h-screen antialiased font-sans" style={{ background: '#F9F5EE' }}>
            {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenLogout={() => setShowLogoutModal(true)} />

            <div className="flex-1 flex flex-col min-w-0">
                <div className="sticky top-0 z-30 px-8 py-4" style={{ background: '#FFFDF8', borderBottom: '1px solid #E5D5B5' }}>
                    <h1 className="text-lg font-black" style={{ color: '#3B0E1E' }}>{title}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-6 h-0.5" style={{ background: '#C9A227' }}/>
                        <p className="text-xs" style={{ color: '#9a7070' }}>{sub}</p>
                    </div>
                </div>

                <main className="flex-1 p-8">
                    {activeTab === 'list'       && <BookList />}
                    {activeTab === 'add'        && <AddBook onSuccess={() => setActiveTab('list')} />}
                    {activeTab === 'categories' && <CategoryList />}
                    {activeTab === 'users'      && <UserManagement />}
                    {activeTab === 'logs'       && <AuditLogList />}
                    {activeTab === 'admins'     && <AdminManagement />}
                    {activeTab === 'account'    && <AdminPasswordSettings />}
                </main>
            </div>
        </div>
    );
}
