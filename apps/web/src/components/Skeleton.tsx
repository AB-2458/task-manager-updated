/**
 * Skeleton Components - Modern Loading Placeholders
 */

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`bg-slate-700/50 rounded-lg animate-pulse ${className}`} />
    );
}

export function TaskSkeleton() {
    return (
        <div className="card-modern p-4">
            <div className="flex items-start gap-4">
                <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
            </div>
        </div>
    );
}

export function TaskListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <TaskSkeleton key={i} />
            ))}
        </div>
    );
}

export function NoteSkeleton() {
    return (
        <div className="card-modern p-5">
            <div className="space-y-3 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="pt-3 border-t border-slate-700/50">
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

export function NoteListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <NoteSkeleton key={i} />
            ))}
        </div>
    );
}

export default Skeleton;
