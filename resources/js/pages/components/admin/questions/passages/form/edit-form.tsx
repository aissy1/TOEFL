import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PassagesFormData } from '@/types';
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
        title: 'Edit',
        href: '/',
    },
];

export default function EditPassages({ passages }: { passages: PassagesFormData }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Passage" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Edit Passage</h1>
                <PassagesForm method="put" submitUrl={`/admin/questions/passage/put/${passages.id}`} initialData={passages} />
            </div>
        </AppLayout>
    );
}
