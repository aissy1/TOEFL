import '../css/app.css';

import { Toaster } from '@/components/ui/sonner';
import { createInertiaApp, usePage } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
function FlashToast() {
    const { flash } = usePage().props as {
        flash?: { success?: string | null; error?: string | null };
    };
    const prev = useRef({ success: '', error: '' });

    useEffect(() => {
        if (flash?.success && flash.success !== prev.current.success) {
            toast.success(flash.success);
            prev.current.success = flash.success;
        }
        if (flash?.error && flash.error !== prev.current.error) {
            toast.error(flash.error);
            prev.current.error = flash.error;
        }
    }, [flash?.success, flash?.error]);

    return null;
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <FlashToast />
                <Toaster position="top-right" richColors />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
