'use client';

import { BookOpen, BookPlus, Library, LogOut, Tags, Users } from 'lucide-react';

interface SidebarProps {
    activeTab: 'list' | 'add' | 'categories' | 'users';
    setActiveTab: (tab: 'list' | 'add' | 'categories' | 'users') => void;
    onOpenLogout: () => void;
}

const navItems = [
    { key: 'list',       icon: Library,    label: 'Danh sách sách' },
    { key: 'add',        icon: BookPlus,   label: 'Thêm sách mới'  },
    { key: 'categories', icon: Tags,       label: 'Danh mục'       },
    { key: 'users',      icon: Users,      label: 'Người dùng'     },
] as const;

export default function Sidebar({ activeTab, setActiveTab, onOpenLogout }: SidebarProps) {
    return (
        <aside className="w-56 bg-[#0f1923] text-white flex flex-col sticky top-0 h-screen shrink-0">
            {/* Logo */}
            <div className="p-5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow">
                        <BookOpen size={16} className="text-white"/>
                    </div>
                    <div>
                        <p className="font-black text-sm tracking-tight leading-none">E-Library</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1 mt-2">
                {navItems.map(({ key, icon: Icon, label }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                            activeTab === key
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                : 'text-slate-500 hover:text-white hover:bg-white/10'
                        }`}>
                        <Icon size={16}/> {label}
                    </button>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-white/10">
                <button onClick={onOpenLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-all">
                    <LogOut size={16}/> Đăng xuất
                </button>
            </div>
        </aside>
    );
}
