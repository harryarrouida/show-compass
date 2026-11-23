import { useEffect } from 'react';
import { IoCheckmarkCircle, IoClose, IoWarning, IoInformation, IoAlert } from 'react-icons/io5';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />,
        error: <IoWarning className="w-5 h-5 text-red-400" />,
        info: <IoInformation className="w-5 h-5 text-blue-400" />,
        warning: <IoAlert className="w-5 h-5 text-amber-400" />
    };

    const backgrounds = {
        success: 'bg-emerald-500/10 border-emerald-500/20',
        error: 'bg-red-500/10 border-red-500/20',
        info: 'bg-blue-500/10 border-blue-500/20',
        warning: 'bg-amber-500/10 border-amber-500/20'
    };

    return (
        <div className="fixed bottom-4 right-4 left-4 z-50 sm:left-auto sm:max-w-md animate-slide-up">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-background-secondary ${backgrounds[type]} shadow-lg`}>
                {icons[type]}
                <p role={type === "error" ? "alert" : "status"} className="text-sm text-text-primary">{message}</p>
                <button
                    onClick={onClose}
                    aria-label="Dismiss notification"
                    className="ml-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                    <IoClose className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
