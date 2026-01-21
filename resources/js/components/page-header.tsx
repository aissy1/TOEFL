import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    icon?: ReactNode;
    action?: ReactNode;
    children?: ReactNode;
}

export default function PageHeader({ title, action, children, icon }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
                {icon && <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">{icon}</span>}
                <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
                {children}
                {action}
            </div>
        </div>
    );
}
