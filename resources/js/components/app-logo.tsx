import { ChartNoAxesColumnIncreasing } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="text-sidebar-primary-foreground border-sidebar-border bg-sidebar-primary-foreground/10 flex aspect-square size-8 items-center justify-center rounded-md border">
                <ChartNoAxesColumnIncreasing className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">Dashboard</span>
            </div>
        </>
    );
}
