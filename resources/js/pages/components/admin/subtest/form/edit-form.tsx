import AppLayout from '@/layouts/app-layout';
import { SubtestFormData, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import SubtestForm from './subtest-form';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subtest',
        href: '/admin/subtest',
    },
    {
        title: 'Edit Subtest',
        href: '/',
    },
];

interface EditProps {
    subtest: SubtestFormData;
}

export default function EditSubtest({ subtest }: EditProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Subtest" />

            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Edit Subtest</h1>

                <SubtestForm mode="edit" submitUrl={`/admin/subtest/update/${subtest.id}`} initialData={subtest} />
            </div>
        </AppLayout>
    );
}
