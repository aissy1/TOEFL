import PageHeader from '@/components/page-header';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { confirmDialog } from '@/pages/components/utils/popup-modal';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BookCheckIcon } from 'lucide-react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Toefl Test Attempts',
        href: '/admin/attempts',
    },
    {
        title: 'Attempts',
        href: '/',
    },
];

interface Attempt {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    started_at: string | null;
    finished_at: string | null;
}

interface props {
    toefl: {
        id: number;
        name: string;
        code: string;
        subtests: number;
    };
    attempts: {
        data: Attempt[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
        from: number;
        to: number;
        total: number;
    };
}

export default function TestAttemptsDetails({ toefl, attempts }: props) {
    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleString();
    };

    const handleDelete = async (id: number, userId: number) => {
        const confirmed = await confirmDialog({
            title: 'Delete attempt?',
            text: 'User attempt will be permanently removed.',
            confirmText: 'Delete',
            icon: 'warning',
        });

        if (!confirmed) return;

        router.delete(`delete/${id}/${userId}`, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'User Attempt has been deleted.',
                    icon: 'success',
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Failed!',
                    text: 'Failed to delete user.',
                    icon: 'error',
                });
            },
        });
    };

    const handleRoute = (mode: 'view' | 'delete', id: number, userId: number) => {
        switch (mode) {
            case 'view':
                router.visit(`/admin/attempts/toefl/${id}/${userId}`);
                break;
            case 'delete':
                handleDelete(id, userId);
                break;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Attempts Details" />

            <div className="flex h-full w-full flex-1 flex-col rounded-xl p-4">
                <PageHeader title={`Test Attempts - ${toefl.name}`} icon={<BookCheckIcon size={20} />} />

                <div className="overflow-x-auto rounded border bg-white shadow-sm">
                    <table className="w-full table-auto text-sm">
                        <thead className="bg-gray-50 text-left text-xs tracking-wider text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3 text-center">Started</th>
                                <th className="px-4 py-3 text-center">Finished</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {attempts.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-6 text-center text-gray-400">
                                        No test attempts found
                                    </td>
                                </tr>
                            )}

                            {attempts.data.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRoute('view', item.id, item.user.id);
                                    }}
                                    className="cursor-pointer transition hover:bg-blue-50/40"
                                >
                                    <td className="px-4 py-3 font-medium text-gray-800">{item.user.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{item.user.email}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{formatDate(item.started_at)}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{formatDate(item.finished_at)}</td>
                                    <td className="px-4 py-3 text-center">
                                        {item.finished_at ? (
                                            <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Completed</span>
                                        ) : (
                                            <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">In Progress</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRoute('delete', item.id, item.user.id);
                                            }}
                                            className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:cursor-pointer hover:bg-red-700"
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination
                        currentPage={attempts.current_page}
                        lastPage={attempts.last_page}
                        nextPageUrl={attempts.next_page_url}
                        prevPageUrl={attempts.prev_page_url}
                        from={attempts.from}
                        to={attempts.to}
                        total={attempts.total}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
