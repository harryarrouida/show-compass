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
    const baseClasses = 'bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden backdrop-blur-sm';
    const hoverClasses = hover ? 'hover:border-zinc-700/50 hover:bg-zinc-800/30 transition-all duration-300' : '';
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