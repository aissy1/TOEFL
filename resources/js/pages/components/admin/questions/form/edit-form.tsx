import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, type QuestionFormData } from '@/types';
import { Head } from '@inertiajs/react';
import QuestionsForm from './questions-form';

import { SubtestMaster } from '@/types';

interface Props {
    subtestMaster: SubtestMaster[];
}

type context = {
    toefl: number;
    subtest: number;
    toeflSubtest: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Questions',
        href: '/admin/questions',
    },
    {
        title: 'Toefl Subtest Questions',
        href: '/admin/questions/',
    },
    {
        title: 'Edit Subtest Questions',
        href: '/',
    },
];

export default function EditToefl({ context, questions }: { context: context; questions: QuestionFormData }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Toefl" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-semibold">Edit Subtest Question</h1>
                <QuestionsForm
                    submitUrl={`/admin/questions/${context.toefl}/subtest/${context.toeflSubtest}/${context.subtest}/update/${questions.id}`}
                    method="put"
                    initialData={questions}
                />
            </div>
        </AppLayout>
    );
}
