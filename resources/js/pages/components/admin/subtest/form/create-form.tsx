import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import SubtestForm from './subtest-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subtest',
        href: '/admin/subtest',
    },
    {
        title: 'Create Subtest',
        href: '/',
    },
];

export default function CreateSubtest() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Subtest" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="mb-6 text-2xl font-semibold">Create Subtest</h1>

                <SubtestForm mode="create" submitUrl="/admin/subtest/create" />
            </div>
        </AppLayout>
    );
}
