import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { LibraryBig } from 'lucide-react';
import Swal from 'sweetalert2';
import { confirmDialog } from '../../utils/popup-modal';

interface Question {
    id: number;
    passage_id: number | null;
    subtest_id: string;
    order: number;
    question_type: string;
    question: string;
    choices: { A: string; B: string; C: string; D: string };
    point: number;
    keywords: string[];
}

interface Props {
    toefl: {
        id: number;
        name: string;
        status: string;
    };
    subtest: {
        id: number;
        name: string;
        total_questions?: number;
        score?: number;
    };
    toeflSubtest: {
        id: number;
        subtest_id: number;
        total_questions?: number;
        passing_score?: number;
    };
    questions: Question[];
    totalScore: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Questions',
        href: '/admin/questions',
    },
    {
        title: 'Toefl Subtest Questions',
        href: '/',
    },
];

export default function QuestionsDetails({ toefl, subtest, toeflSubtest, questions, totalScore }: Props) {
    const handleRoute = (mode: 'create' | 'edit' | 'delete' | 'preview' | 'indexPassage', idQuestion?: number) => {
        switch (mode) {
            case 'create':
                router.visit(`/admin/questions/${toefl.id}/subtest/${toeflSubtest.id}/${subtest.id}/create`);
                break;

            case 'edit':
                router.get(`/admin/questions/${toefl.id}/subtest/${toeflSubtest.id}/${subtest.id}/edit/${idQuestion}`);
                break;
            case 'delete':
                handleDelete(idQuestion!);
                break;
            case 'preview':
                router.visit(`/admin/questions/${toefl.id}/subtest/${toeflSubtest.id}/${subtest.id}/preview/${idQuestion}`);
                break;
            case 'indexPassage':
                router.get('/admin/questions/passage');
                break;
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirmDialog({
            title: 'Delete Questions?',
            text: 'Questions will be permanently removed.',
            confirmText: 'Delete',
            icon: 'warning',
        });

        if (!confirmed) return;

        router.delete(`/admin/questions/${toefl.id}/subtest/${toeflSubtest.id}/${subtest.id}/delete/${id}`, { replace: true });

        Swal.fire({
            title: 'Deleted!',
            text: 'Questions has been deleted.',
            icon: 'success',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Questions" />
            <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-xl p-4">
                <PageHeader
                    title="Bank Questions"
                    icon={<LibraryBig size={20} />}
                    action={
                        <>
                            <button
                                onClick={() => handleRoute('create')}
                                className="cursor-pointer rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                            >
                                + Add Question
                            </button>
                            <button
                                onClick={() => handleRoute('indexPassage')}
                                className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                Data Passage
                            </button>
                        </>
                    }
                ></PageHeader>

                {/* info toefl and subtest */}
                <div className="mb-4 overflow-x-auto rounded border bg-white">
                    <table className="w-full table-fixed text-sm">
                        <caption className="caption-top bg-gray-200 p-4 text-xl font-medium">Detail Information</caption>
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="py-3 text-center">Packet Toefl</th>
                                <th className="py-3 text-center">Subtest</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Question</th>
                                <th className="px-4 py-3 text-center">Max Question</th>
                                <th className="px-4 py-3 text-center">Score</th>
                                <th className="px-4 py-3 text-center">Max Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th className="py-3 text-center">{toefl.name}</th>
                                <th className="py-3 text-center">{subtest.name}</th>
                                <th className="px-4 py-3 text-center">{toefl.status}</th>
                                <th className="px-4 py-3 text-center">{subtest.total_questions ?? questions.length}</th>
                                <th className="px-4 py-3 text-center">{toeflSubtest.total_questions}</th>
                                <th className="px-4 py-3 text-center">{totalScore ?? 0}</th>
                                <th className="px-4 py-3 text-center">{toeflSubtest.passing_score ?? 0}</th>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded border bg-white">
                    <table className="w-full table-fixed text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="py-3 text-center">No</th>
                                <th className="py-3 text-center">Passage</th>
                                <th className="px-4 py-3 text-center">Question</th>
                                <th className="px-4 py-3 text-center">Question Type</th>
                                <th className="px-4 py-3 text-center">Point</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-gray-500">
                                        No questions available
                                    </td>
                                </tr>
                            ) : (
                                questions.map((q, index) => (
                                    <tr key={q.id} onClick={() => handleRoute('preview', q.id)} className="cursor-pointer border-t hover:bg-gray-50">
                                        <td className="py-3 text-center">{index + 1}</td>
                                        <td className="px-4 py-3 text-center">{q.passage_id}</td>
                                        <td className="px-4 py-3">{q.question}</td>
                                        <td className="px-4 py-3 text-center">{q.question_type}</td>
                                        <td className="px-4 py-3 text-center">{q.point}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRoute('edit', q.id);
                                                }}
                                                className="text-white"
                                            >
                                                Edit
                                            </Button>
                                            &nbsp;
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRoute('delete', q.id);
                                                }}
                                                variant="destructive"
                                                className="cursor-pointer text-white"
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
