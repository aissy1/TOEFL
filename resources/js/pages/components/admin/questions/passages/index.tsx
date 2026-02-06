import PageHeader from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { confirmDialog } from '@/pages/components/utils/popup-modal';

import { Button } from '@/components/ui/button';
import { type BreadcrumbItem, type PassagesFormData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { LibraryBig } from 'lucide-react';
import Swal from 'sweetalert2';

interface props {
    passages: PassagesFormData[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Questions',
        href: '/admin/questions',
    },
    {
        title: 'Passages',
        href: '/',
    },
];

export default function PassagesIndex({ passages }: props) {
    const handleRoute = (mode: 'create' | 'edit' | 'delete' | 'preview' | 'indexQuestions', id?: number) => {
        switch (mode) {
            case 'create':
                router.visit('/admin/questions/passage/create');
                break;

            case 'edit':
                router.get(`/admin/questions/passage/edit/${id}`);
                break;

            case 'delete':
                handleDelete(id!);
                break;

            case 'preview':
                console.log(`preview passage id : ${id}`);

                router.visit(`/admin/questions/passage/preview/${id}`);
                break;

            case 'indexQuestions':
                router.get('/admin/questions');
                break;
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirmDialog({
            title: 'Delete Passage?',
            text: 'User will be permanently removed.',
            confirmText: 'Delete',
            icon: 'warning',
        });

        if (!confirmed) return;

        router.delete(`/admin/questions/passage/delete/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Passage has been deleted.',
                    icon: 'success',
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Failed!',
                    text: 'Failed to delete Passage.',
                    icon: 'error',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Passages" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <PageHeader
                    title="Passages"
                    icon={<LibraryBig size={20} />}
                    action={
                        <>
                            <button
                                onClick={() => handleRoute('create')}
                                className="cursor-pointer rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                            >
                                + Add Passage
                            </button>
                            <button
                                onClick={() => handleRoute('indexQuestions')}
                                className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                Data Questions
                            </button>
                        </>
                    }
                ></PageHeader>

                {/* Table */}
                <div className="overflow-x-auto rounded border bg-white">
                    <table className="w-full table-fixed text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-center">Id_Passage</th>
                                <th className="px-4 py-3 text-center">Subtest</th>
                                <th className="px-4 py-3 text-center">Title</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {passages.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                        No data available
                                    </td>
                                </tr>
                            )}
                            {passages.map((passage) => {
                                return (
                                    <>
                                        <tr
                                            key={passage.id}
                                            onClick={() => handleRoute('preview', passage.id)}
                                            className="cursor-pointer truncate hover:bg-gray-100"
                                        >
                                            <td className="px-4 py-3 text-center">{passage.id}</td>
                                            <td className="px-4 py-3 text-center">{passage.subtest_id}</td>
                                            <td className="px-4 py-3 text-center">{passage.title}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRoute('edit', passage.id);
                                                    }}
                                                    className="text-white"
                                                >
                                                    Edit
                                                </Button>
                                                &nbsp;
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRoute('delete', passage.id);
                                                    }}
                                                    variant={'destructive'}
                                                    className="cursor-pointer text-white"
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
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
