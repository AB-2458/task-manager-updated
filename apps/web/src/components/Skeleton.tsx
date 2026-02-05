/**
 * Skeleton Components
 * 
 * Loading placeholders for tasks and notes
 */

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-surface-700 rounded ${className}`}
        />
    );
}

export function TaskSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-surface-700 bg-surface-800">
            {/* Checkbox skeleton */}
            <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
            {/* Title skeleton */}
            <Skeleton className="h-4 flex-1 max-w-[200px]" />
        </div>
    );
}

export function TaskListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <TaskSkeleton key={i} />
            ))}
        </div>
    );
}

export function NoteSkeleton() {
    return (
        <div className="card p-4">
            {/* Content skeleton */}
            <div className="space-y-2 mb-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            {/* Footer skeleton */}
            <div className="pt-3 border-t border-surface-700">
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

export function NoteListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: count }).map((_, i) => (
                <NoteSkeleton key={i} />
            ))}
        </div>
    );
}

export default Skeleton;
