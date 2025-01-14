import { useEffect } from 'react';
import { IoCheckmarkCircle, IoClose, IoWarning } from 'react-icons/io5';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

export const Toast = ({ message, type = 'success', onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />,
        error: <IoWarning className="w-5 h-5 text-red-400" />,
        info: <IoWarning className="w-5 h-5 text-blue-400" />
    };

    const backgrounds = {
        success: 'bg-emerald-500/10 border-emerald-500/20',
        error: 'bg-red-500/10 border-red-500/20',
        info: 'bg-blue-500/10 border-blue-500/20'
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${backgrounds[type]}`}>
                {icons[type]}
                <p className="text-sm text-zinc-200">{message}</p>
                <button
                    onClick={onClose}
                    className="ml-2 text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                    <IoClose className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
