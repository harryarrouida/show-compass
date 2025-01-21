interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export default function Card({
    children,
    className = '',
    hover = false,
    onClick
}: CardProps) {
    const baseClasses = 'bg-zinc-800/30 border border-zinc-700/50 rounded-xl';
    const hoverClasses = hover ? 'hover:bg-zinc-800/40 hover:border-zinc-600/50 transition-all duration-300' : '';
    const clickClasses = onClick ? 'cursor-pointer' : '';
    
    return (
        <div 
            className={`${baseClasses} ${hoverClasses} ${clickClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}