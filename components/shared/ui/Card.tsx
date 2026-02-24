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
    const baseClasses = 'bg-background-secondary border border-border-primary rounded-xl';
    const hoverClasses = hover ? 'hover:bg-background-tertiary hover:border-border-hover transition-all duration-300' : '';
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