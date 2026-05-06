import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
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
        title: 'Create',
        href: '/',
    },
];

export default function CreatePassages() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Question" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Create Passage</h1>
                <PassagesForm submitUrl={`/admin/questions/passage/store`} />
            </div>
        </AppLayout>
    );
}
