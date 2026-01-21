import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

import { PageProps, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { LibraryBig } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Questions',
        href: 'admin/questions',
    },
];

interface questions {
    id: number;
    question: string;
    subtest_id: number;
    question_type: string;
    max_score: number;
}

interface QuestionIndexProps extends PageProps {
    questions: questions[];
}

export default function UsersIndex({ questions }: QuestionIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <PageHeader
                    title="Bank Questions"
                    icon={<LibraryBig size={20} />}
                    action={<button className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-blue-700">+ Add Question</button>}
                >
                    <input type="text" placeholder="Search Questions..." className="w-64 rounded border px-3 py-2" />
                </PageHeader>

                {/* Table */}
                <div className="overflow-x-auto rounded border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">id</th>
                                <th className="px-4 py-3 text-left">Question</th>
                                <th className="px-4 py-3 text-left">Subtest</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Max_Score</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.length > 0 ? (
                                questions.map((question) => (
                                    <tr key={question.id} className="border-t">
                                        <td className="px-4 py-3">{question.id}</td>
                                        <td className="px-4 py-3">{question.question}</td>
                                        <td className="px-4 py-3">{question.subtest_id}</td>
                                        <td className="px-4 py-3">{question.question_type}</td>
                                        <td className="px-4 py-3">{question.max_score}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:cursor-pointer hover:bg-blue-700">
                                                Edit
                                            </Button>
                                            &nbsp;
                                            <Button className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:cursor-pointer hover:bg-red-700">
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
