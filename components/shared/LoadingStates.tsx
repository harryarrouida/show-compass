import { CardSkeleton } from "./LoadingSkeleton";

interface LoadingStateProps {
    type: 'spinner' | 'skeleton' | 'progress';
    text?: string;
    className?: string;
}

export function LoadingState({ type, text, className = '' }: LoadingStateProps) {
    const spinnerContent = (
        <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-violet-400" />
            {text && <span className="text-sm text-zinc-400">{text}</span>}
        </div>
    );

    const progressContent = (
        <div className="w-full">
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-violet-400 rounded-full animate-progress" 
                     style={{ width: '75%' }} />
            </div>
            {text && (
                <p className="text-xs text-zinc-400 mt-2 text-center">{text}</p>
            )}
        </div>
    );

    return (
        <div className={`flex items-center justify-center p-4 ${className}`}>
            {type === 'spinner' && spinnerContent}
            {type === 'progress' && progressContent}
            {type === 'skeleton' && <CardSkeleton />}
        </div>
    );
} 