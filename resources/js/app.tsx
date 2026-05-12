import '../css/app.css';

import { Toaster } from '@/components/ui/sonner';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function AudioNotificationPoller() {
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/admin/audio-notifications');
                const json = await res.json();

                if (json.status === 'done') {
                    toast.success(`Audio "${json.title}" berhasil di-generate!`);
                } else if (json.status === 'failed') {
                    toast.error(`Gagal generate audio "${json.title}". Coba lagi.`);
                }
                // status 'processing' → diam saja, lanjut polling
            } catch {
                // silent fail — misal saat halaman login yang tidak punya route ini
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

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
                <AudioNotificationPoller />
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
