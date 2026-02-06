import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import PassagesForm from './passage-form';

type link = {
    toefl: number;
    subtest: number;
};

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

export default function CreatePassages({ link }: { link: link }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Question" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Create Passage</h1>
                <PassagesForm submitUrl={`/admin/questions/${link.toefl}/passage/${link.subtest}/store`} link={link} />
            </div>
        </AppLayout>
    );
}
