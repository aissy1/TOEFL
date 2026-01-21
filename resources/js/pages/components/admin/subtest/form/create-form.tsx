import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import SubtestForm from './subtest-form';

export default function CreateSubtest() {
    return (
        <AppLayout>
            <Head title="Create Subtest" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="mb-6 text-2xl font-semibold">Create Subtest</h1>

                <SubtestForm mode="create" submitUrl="/admin/subtest/create" />
            </div>
        </AppLayout>
    );
}
