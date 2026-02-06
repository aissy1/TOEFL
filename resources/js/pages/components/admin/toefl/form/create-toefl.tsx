import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ToeflForm from './toefl-form';

import { SubtestMaster } from '@/types';

interface Props {
    subtestMaster: SubtestMaster[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Toefl',
        href: '/admin/toefl',
    },
    {
        title: 'Create',
        href: '/',
    },
];

export default function CreateToefl({ subtestMaster }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Toefl" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="mb-6 text-2xl font-semibold">Create Toefl</h1>
                <ToeflForm submitUrl="/admin/toefl/create" mode="create" subtestMaster={subtestMaster} />
            </div>
        </AppLayout>
    );
}
