import AppLayout from '@/layouts/app-layout';
import { SubtestFormData } from '@/types';
import { Head } from '@inertiajs/react';
import SubtestForm from './subtest-form';

interface EditProps {
    subtest: SubtestFormData;
}

export default function EditSubtest({ subtest }: EditProps) {
    return (
        <AppLayout>
            <Head title="Edit Subtest" />

            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Edit Subtest</h1>

                <SubtestForm mode="edit" submitUrl={`/admin/subtest/update/${subtest.id}`} initialData={subtest} />
            </div>
        </AppLayout>
    );
}
