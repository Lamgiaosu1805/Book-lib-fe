'use client';

import { BookPlus, Library, LogOut, Tags, Users, ScrollText, ShieldCheck } from 'lucide-react';

const Cross = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
        <rect x="13" y="2" width="6" height="28" rx="2"/>
        <rect x="4" y="10" width="24" height="6" rx="2"/>
    </svg>
);

interface SidebarProps {
    activeTab: 'list' | 'add' | 'categories' | 'users' | 'logs' | 'admins';
    setActiveTab: (tab: 'list' | 'add' | 'categories' | 'users' | 'logs' | 'admins') => void;
    onOpenLogout: () => void;
}

const navItems = [
    { key: 'list',       icon: Library,      label: 'Danh sách sách'  },
    { key: 'add',        icon: BookPlus,     label: 'Thêm sách mới'   },
    { key: 'categories', icon: Tags,         label: 'Danh mục'        },
    { key: 'users',      icon: Users,        label: 'Người dùng'      },
    { key: 'logs',       icon: ScrollText,   label: 'Nhật ký'         },
    { key: 'admins',     icon: ShieldCheck,  label: 'Quản trị viên'   },
] as const;

export default function Sidebar({ activeTab, setActiveTab, onOpenLogout }: SidebarProps) {
    return (
        <aside className="w-56 flex flex-col sticky top-0 h-screen shrink-0" style={{ background: '#250A13' }}>
            {/* Logo */}
            <div className="p-5" style={{ borderBottom: '1px solid rgba(201,162,39,0.2)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border"
                         style={{ borderColor: '#C9A227', color: '#C9A227' }}>
                        <Cross size={13}/>
                    </div>
                    <div>
                        <p className="font-black text-white text-xs leading-tight">Thư Viện Công Giáo</p>
                        <p className="text-[9px]" style={{ color: '#C9A227' }}>Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Divider ornament */}
            <div className="flex items-center gap-2 px-4 py-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(201,162,39,0.15)' }}/>
                <span className="text-[9px]" style={{ color: 'rgba(201,162,39,0.4)' }}>✦</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(201,162,39,0.15)' }}/>
            </div>

            {/* Nav */}
            <nav className="px-3 space-y-1 flex-1">
                {navItems.map(({ key, icon: Icon, label }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all"
                        style={{
                            background: activeTab === key ? '#3B0E1E' : 'transparent',
                            color: activeTab === key ? '#C9A227' : '#7a4a58',
                            border: activeTab === key ? '1px solid rgba(201,162,39,0.3)' : '1px solid transparent',
                        }}>
                        <Icon size={14}/> {label}
                    </button>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-3" style={{ borderTop: '1px solid rgba(201,162,39,0.15)' }}>
                <button onClick={onOpenLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-xs transition-all"
                    style={{ color: '#c0504a' }}>
                    <LogOut size={14}/> Đăng xuất
                </button>
            </div>
        </aside>
    );
}
