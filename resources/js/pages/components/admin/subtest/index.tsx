import { PageProps, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { BookCopy } from 'lucide-react';
import Swal from 'sweetalert2';
import { confirmDialog } from '../../utils/popup-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subtests',
        href: 'admin/subtest',
    },
];

interface Subtests {
    id: number;
    name: string;
    order: string;
    slug: string;
}

interface ToeflSubtestProps extends PageProps {
    subtests: Subtests[];
}

export default function SubtestIndex({ subtests }: ToeflSubtestProps) {
    const handleDelete = async (id: number) => {
        const confirmed = await confirmDialog({
            title: 'Delete Toefl?',
            text: 'Toefl will be permanently removed.',
            confirmText: 'Delete',
            icon: 'warning',
        });

        if (!confirmed) return;

        router.delete(`/admin/toefl/delete/${id}`);

        Swal.fire({
            title: 'Deleted!',
            text: 'User has been deleted.',
            icon: 'success',
        });
    };

    const handleRoute = (mode: 'create' | 'edit' | 'delete', id?: number) => {
        switch (mode) {
            case 'create':
                router.visit('/admin/subtest/create');
                break;

            case 'edit':
                router.get(`/admin/subtest/edit/${id}`);
                break;

            case 'delete':
                handleDelete(id!);
                break;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Toefl" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <PageHeader
                    title="Master Toefl Subtest"
                    icon={<BookCopy size={20} />}
                    action={
                        <button
                            onClick={() => handleRoute('create')}
                            className="cursor-pointer rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                        >
                            + Add Subtest
                        </button>
                    }
                >
                    <input type="text" placeholder="Search Toefl Subtest . . ." className="w-64 rounded border px-3 py-2" />
                </PageHeader>

                {/* Table */}
                <div className="overflow-x-auto rounded border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Subtest_Id</th>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Order</th>
                                <th className="px-4 py-3 text-left">Slug</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subtests.length > 0 ? (
                                subtests.map((subtest) => (
                                    <tr key={subtest.id} className="border-t">
                                        <td className="px-4 py-3">{subtest.id}</td>
                                        <td className="px-4 py-3">{subtest.name}</td>
                                        <td className="px-4 py-3">{subtest.order}</td>
                                        <td className="px-2 py-2">{subtest.slug}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Button
                                                onClick={() => handleRoute('edit', subtest.id)}
                                                className="cursor-pointer rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                            >
                                                Edit
                                            </Button>
                                            &nbsp;
                                            <Button
                                                onClick={() => handleRoute('delete', subtest.id)}
                                                className="cursor-pointer rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-700"
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
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
