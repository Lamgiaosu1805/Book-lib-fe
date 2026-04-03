'use client';

import { LayoutDashboard, BookPlus, Library, LogOut, Tags, Users } from 'lucide-react';

interface SidebarProps {
    activeTab: 'list' | 'add' | 'categories' | 'users'; // ✅ Thêm 'users' vào đây
    setActiveTab: (tab: 'list' | 'add' | 'categories' | 'users') => void;
    onOpenLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onOpenLogout }: SidebarProps) {
    return (
        <aside className="w-64 bg-[#0F172A] text-white flex flex-col sticky top-0 h-screen shadow-2xl">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
                <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                    <LayoutDashboard size={20} className="text-white" />
                </div>
                <span className="font-bold tracking-tight text-lg uppercase leading-none mt-1">Admin Panel</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                    <Library size={18} /> Danh sách sách
                </button>

                <button
                    onClick={() => setActiveTab('add')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'add' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                    <BookPlus size={18} /> Thêm sách mới
                </button>

                <button
                    onClick={() => setActiveTab('categories')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                    <Tags size={18} /> Quản lý danh mục
                </button>

                {/* ✅ NÚT QUẢN LÝ NGƯỜI DÙNG MỚI */}
                <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                    <Users size={18} /> Quản lý người dùng
                </button>
            </nav>

            <div className="p-4 border-t border-slate-800/50 mt-auto">
                <button
                    onClick={onOpenLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 font-bold hover:bg-red-400/10 transition-all"
                >
                    <LogOut size={18} /> Đăng xuất
                </button>
            </div>
        </aside>
    );
}