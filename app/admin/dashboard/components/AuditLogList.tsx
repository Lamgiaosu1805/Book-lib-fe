'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, ChevronLeft, ChevronRight, BookOpen, Users, Tag, Trash2, Pencil, Upload, PlusCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

const ACTION_ICON: Record<string, any> = {
    'Thêm sách mới':       { icon: PlusCircle,   color: '#22c55e' },
    'Sửa thông tin sách':  { icon: Pencil,        color: '#3b82f6' },
    'Tải lại file PDF':    { icon: Upload,         color: '#8b5cf6' },
    'Xóa sách':            { icon: Trash2,         color: '#ef4444' },
    'Xóa mềm sách':        { icon: Trash2,         color: '#ef4444' },
    'Khôi phục sách':      { icon: ShieldCheck,    color: '#10b981' },
    'Xóa vĩnh viễn sách':  { icon: Trash2,         color: '#991b1b' },
    'Đình chỉ tài khoản':  { icon: ShieldAlert,   color: '#f97316' },
    'Khôi phục tài khoản': { icon: ShieldCheck,   color: '#10b981' },
    'Thêm danh mục':       { icon: Tag,            color: '#06b6d4' },
    'Xóa danh mục':        { icon: Tag,            color: '#ef4444' },
};

const TARGET_ICON: Record<string, any> = {
    'Sách':        BookOpen,
    'Người dùng':  Users,
    'Danh mục':    Tag,
};

export default function AuditLogList() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const getToken = () => {
        const ca = document.cookie.split(';');
        for (const c of ca) {
            const t = c.trim();
            if (t.startsWith('token=')) return t.substring(6);
        }
        return '';
    };

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/logs?page=${page}&limit=20`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setLogs(res.data.items || []);
            setTotalPages(res.data.meta?.totalPages || 1);
            setTotal(res.data.meta?.total || 0);
            setCurrentPage(page);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(1); }, []);

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    };

    return (
        <div className="space-y-4">
            {/* Header stats */}
            <div className="flex items-center justify-between px-1">
                <p className="text-sm font-semibold" style={{ color: '#7a3a46' }}>
                    Tổng cộng <span className="font-black" style={{ color: '#3B0E1E' }}>{total}</span> bản ghi
                </p>
                <button onClick={() => fetchLogs(currentPage)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{ color: '#C9A227', border: '1px solid #E5D5B5', background: '#FFFDF8' }}>
                    Làm mới
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E5D5B5', background: '#FFFDF8' }}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin" style={{ color: '#C9A227' }}/>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 text-sm font-semibold" style={{ color: '#9a7070' }}>
                        Chưa có nhật ký nào
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead style={{ background: '#F9F5EE', borderBottom: '1px solid #E5D5B5' }}>
                            <tr>
                                {['Thời gian', 'Quản trị viên', 'Hành động', 'Đối tượng', 'Chi tiết'].map(h => (
                                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest"
                                        style={{ color: '#9a7070' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, i) => {
                                const actionConf = ACTION_ICON[log.action] || { icon: Pencil, color: '#9a7070' };
                                const ActionIcon = actionConf.icon;
                                const TargetIcon = TARGET_ICON[log.targetType] || BookOpen;
                                const targetLabel = log.targetTitle || log.targetId || '';
                                return (
                                    <tr key={log._id}
                                        style={{ borderBottom: i < logs.length - 1 ? '1px solid #F5EDD8' : 'none' }}
                                        className="hover:bg-[#FAF7F2] transition-colors">
                                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#9a7070' }}>
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                                                     style={{ background: '#3B0E1E' }}>
                                                    {log.adminName?.charAt(0)?.toUpperCase() || 'A'}
                                                </div>
                                                <span className="text-xs font-semibold" style={{ color: '#3B0E1E' }}>
                                                    {log.adminName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1.5">
                                                <span className="flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1 rounded-full"
                                                      style={{ background: `${actionConf.color}15`, color: actionConf.color }}>
                                                    <ActionIcon size={11}/>
                                                    {log.action}
                                                </span>
                                                {targetLabel && (
                                                    <p className="text-[11px] font-semibold max-w-[220px] truncate"
                                                       title={targetLabel}
                                                       style={{ color: '#7a3a46' }}>
                                                        {log.targetType}: {targetLabel}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#7a3a46' }}>
                                                <TargetIcon size={13}/>
                                                <span className="truncate max-w-[180px]" title={targetLabel}>
                                                    {targetLabel || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs" style={{ color: '#b08080' }}>
                                            {log.detail || '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => fetchLogs(currentPage - 1)} disabled={currentPage === 1}
                        className="p-2 rounded-lg transition-all disabled:opacity-40"
                        style={{ border: '1px solid #E5D5B5', color: '#7a3a46' }}>
                        <ChevronLeft size={16}/>
                    </button>
                    <span className="text-xs font-semibold px-3" style={{ color: '#7a3a46' }}>
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button onClick={() => fetchLogs(currentPage + 1)} disabled={currentPage === totalPages}
                        className="p-2 rounded-lg transition-all disabled:opacity-40"
                        style={{ border: '1px solid #E5D5B5', color: '#7a3a46' }}>
                        <ChevronRight size={16}/>
                    </button>
                </div>
            )}
        </div>
    );
}
