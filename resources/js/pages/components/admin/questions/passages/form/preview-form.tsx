import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, type PassagesFormData } from '@/types';
import { Head } from '@inertiajs/react';
import PassagesForm from './passage-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Questions',
        href: '/admin/questions',
    },
    {
        title: 'Passages',
        href: '/admin/questions/passage',
    },
    {
        title: 'Preview',
        href: '/',
    },
];

export default function PreviewPassages({ passages }: { passages: PassagesFormData }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Preview Passage" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Information Passage</h1>
                <PassagesForm method="preview" submitUrl="/admin/questions/passage/store" initialData={passages} />
            </div>
        </AppLayout>
    );
}
