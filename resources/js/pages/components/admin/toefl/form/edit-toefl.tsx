import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SubtestMaster, ToeflFormData } from '@/types';
import { Head } from '@inertiajs/react';
import ToeflForm from './toefl-form';

interface Props {
    toefl: ToeflFormData;
    subtestMaster: SubtestMaster[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Toefl',
        href: 'admin/toefl',
    },
    {
        title: 'Edit',
        href: 'admin/toefl/edit',
    },
];

export default function EditToefl({ toefl, subtestMaster }: Props) {
    console.log('Editing TOEFL with data:', toefl);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Toefl" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="mb-6 text-2xl font-semibold">Edit Toefl</h1>
                <ToeflForm submitUrl={`/admin/toefl/edit/${toefl.id}`} initialData={toefl} mode="edit" subtestMaster={subtestMaster} />
            </div>
        </AppLayout>
    );
}
