'use client';

import { useState, useCallback, useRef } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

type DialogType = 'confirm' | 'alert' | 'success' | 'error';

interface DialogOptions {
    title?: string;
    message: string;
    type?: DialogType;
    confirmText?: string;
    cancelText?: string;
}

interface DialogState extends DialogOptions {
    isOpen: boolean;
    resolve: ((value: boolean) => void) | null;
}

const icons: Record<DialogType, React.ReactNode> = {
    confirm: <AlertTriangle size={32} color="#C9A227" />,
    alert: <Info size={32} color="#3b82f6" />,
    success: <CheckCircle size={32} color="#22c55e" />,
    error: <XCircle size={32} color="#ef4444" />,
};

const confirmBtnColors: Record<DialogType, string> = {
    confirm: 'background:#3B0E1E;color:#C9A227;',
    alert: 'background:#3b82f6;color:#fff;',
    success: 'background:#16a34a;color:#fff;',
    error: 'background:#dc2626;color:#fff;',
};

export function useDialog() {
    const [state, setState] = useState<DialogState>({
        isOpen: false,
        message: '',
        resolve: null,
    });

    const open = useCallback((options: DialogOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({ ...options, isOpen: true, resolve });
        });
    }, []);

    const handleResult = useCallback((result: boolean) => {
        setState((s) => {
            s.resolve?.(result);
            return { ...s, isOpen: false, resolve: null };
        });
    }, []);

    const confirm = useCallback(
        (message: string, options?: Partial<DialogOptions>) =>
            open({ message, type: 'confirm', ...options }),
        [open],
    );

    const alert = useCallback(
        (message: string, options?: Partial<DialogOptions>) =>
            open({ message, type: 'alert', confirmText: 'Đóng', ...options }),
        [open],
    );

    const success = useCallback(
        (message: string, options?: Partial<DialogOptions>) =>
            open({ message, type: 'success', confirmText: 'Đóng', ...options }),
        [open],
    );

    const error = useCallback(
        (message: string, options?: Partial<DialogOptions>) =>
            open({ message, type: 'error', confirmText: 'Đóng', ...options }),
        [open],
    );

    const dialog = state.isOpen ? (
        <DialogModal
            {...state}
            onConfirm={() => handleResult(true)}
            onCancel={() => handleResult(false)}
        />
    ) : null;

    return { confirm, alert, success, error, dialog };
}

interface DialogModalProps extends DialogOptions {
    isOpen: boolean;
    resolve: ((value: boolean) => void) | null;
    onConfirm: () => void;
    onCancel: () => void;
}

function DialogModal({
    title,
    message,
    type = 'confirm',
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
}: DialogModalProps) {
    const isConfirm = type === 'confirm';
    const defaultConfirmText = isConfirm ? 'Xác nhận' : 'Đóng';
    const defaultCancelText = 'Hủy';

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: 'rgba(15,10,5,0.45)', backdropFilter: 'blur(3px)' }}
            onClick={isConfirm ? undefined : onCancel}
        >
            <div
                className="relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl"
                style={{
                    background: '#FFFDF8',
                    border: '1px solid #E5D5B5',
                    padding: '2rem 1.75rem 1.5rem',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:bg-slate-100"
                    style={{ color: '#9a7070' }}
                >
                    <X size={16} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    {icons[type]}
                </div>

                {/* Title */}
                {title && (
                    <h3
                        className="text-center font-bold text-base mb-2"
                        style={{ color: '#3B0E1E' }}
                    >
                        {title}
                    </h3>
                )}

                {/* Message */}
                <p
                    className="text-center text-sm leading-relaxed"
                    style={{ color: '#7a3a46' }}
                    dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br/>') }}
                />

                {/* Buttons */}
                <div className={`flex gap-3 mt-6 ${isConfirm ? '' : 'justify-center'}`}>
                    {isConfirm && (
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
                            style={{
                                background: '#F5EDD8',
                                color: '#7a3a46',
                                border: '1px solid #E5D5B5',
                            }}
                        >
                            {cancelText || defaultCancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`py-2.5 rounded-xl font-bold text-sm transition-all ${isConfirm ? 'flex-1' : 'px-8'}`}
                        style={
                            type === 'confirm'
                                ? { background: '#3B0E1E', color: '#C9A227' }
                                : type === 'error'
                                  ? { background: '#dc2626', color: '#fff' }
                                  : type === 'success'
                                    ? { background: '#16a34a', color: '#fff' }
                                    : { background: '#3b82f6', color: '#fff' }
                        }
                    >
                        {confirmText || defaultConfirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
