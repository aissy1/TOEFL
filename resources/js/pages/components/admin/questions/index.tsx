import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

import { type BreadcrumbItem, type QuestionIndexProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, LibraryBig } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Questions',
        href: '/admin/questions',
    },
];

export default function QuestionsIndex({ toefls }: QuestionIndexProps) {
    const [open, setOpen] = useState<number | null>(null);

    const handleRoute = (
        mode: 'create' | 'edit' | 'delete' | 'preview' | 'indexPassage',
        id?: number,
        toefl_subtests?: number,
        idSubtest?: number,
    ) => {
        switch (mode) {
            case 'create':
                router.visit('/admin/questions/create');
                break;

            case 'edit':
                router.get(`/admin/toefl/edit/${id}`);
                break;

            case 'indexPassage':
                router.get('/admin/questions/passage');
                break;

            case 'preview':
                router.visit(`/admin/questions/${id}/subtest/${toefl_subtests}/${idSubtest}`);
                break;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Questions" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <PageHeader
                    title="Bank Questions"
                    icon={<LibraryBig size={20} />}
                    action={
                        <button
                            onClick={() => handleRoute('indexPassage')}
                            className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                            Data Passage
                        </button>
                    }
                ></PageHeader>

                {/* Table */}
                <div className="overflow-x-auto rounded border bg-white">
                    <table className="w-full table-fixed text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-center">Toefl</th>
                                <th className="px-4 py-3 text-center">Subtest</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {toefls.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                        No data available
                                    </td>
                                </tr>
                            )}

                            {toefls.map((toefl) => {
                                const isOpen = open === toefl.id;

                                return (
                                    <>
                                        {/* TOEFL ROW */}
                                        <tr
                                            key={toefl.id}
                                            className="cursor-pointer border-t hover:bg-gray-50"
                                            onClick={() => setOpen(isOpen ? null : toefl.id)}
                                        >
                                            <td className="flex items-center gap-2 px-4 py-3 font-medium">
                                                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                {toefl.name}
                                            </td>
                                            <td className="px-4 py-3 text-center">{toefl.toefl_subtests_count}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={
                                                        toefl.status === 'active'
                                                            ? 'w-max rounded-full bg-green-700/80 px-2 py-1 text-white'
                                                            : 'w-max rounded-full bg-red-600/80 px-2 py-1 text-white'
                                                    }
                                                >
                                                    {toefl.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    onClick={() => handleRoute('edit', toefl.id)}
                                                    // className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                                                    variant="default"
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>

                                        {/* SUBTEST ROWS */}
                                        {isOpen &&
                                            toefl.toefl_subtests.map((ts: any) => (
                                                <tr key={ts.id} className="border-t bg-gray-50">
                                                    <td className="px-4 py-3">└ {ts.subtest.name}</td>
                                                    <td className="px-4 py-3 text-center">{ts.subtest.slug}</td>
                                                    <td className="px-4 py-3 text-center">—</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Button
                                                            onClick={() => {
                                                                handleRoute('preview', toefl.id, ts.id, ts.subtest.id);
                                                            }}
                                                            variant="link"
                                                        >
                                                            Preview
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
