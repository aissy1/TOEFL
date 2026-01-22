import { PageProps, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';
import { confirmDialog } from '../../utils/popup-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Toefl',
        href: 'admin/toefl',
    },
];

interface Toefl {
    id: number;
    name: string;
    code: string;
    status: string;
    created_at: string;
}

interface SubtestPivot {
    duration_minutes: number;
    order: number;
    total_questions: number;
    passing_score: number;
}

interface Subtest {
    id: number;
    name: string;
    order: number;
    pivot: SubtestPivot;
}

interface ToeflDetail {
    id: number;
    name: string;
    code: string;
    status: string;
    subtests: Subtest[];
}

interface ToeflIndexProps extends PageProps {
    toefls: Toefl[];
}

export default function ToeflIndex({ toefls }: ToeflIndexProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [details, setDetails] = useState<Record<number, ToeflDetail>>({});
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleToggleRow = async (id: number) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }

        setExpandedId(id);

        // fetch hanya sekali
        if (!details[id]) {
            try {
                setLoadingId(id);

                const response = await axios.get(`/admin/toefl/${id}/subtests`);
                setDetails((prev) => ({
                    ...prev,
                    [id]: response.data.data,
                }));
            } catch (error) {
                Swal.fire('Error', 'Failed to load subtest data', 'error');
            } finally {
                setLoadingId(null);
            }
        }
    };

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
                router.visit('/admin/toefl/create');
                break;

            case 'edit':
                router.get(`/admin/toefl/edit/${id}`);
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
                    title="Toefl"
                    icon={<BookOpen size={20} />}
                    action={
                        <button
                            onClick={() => handleRoute('create')}
                            className="cursor-pointer rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                        >
                            + Add Toefl
                        </button>
                    }
                >
                    <input type="text" placeholder="Search Toefl . . ." className="w-64 rounded border px-3 py-2" />
                </PageHeader>

                {/* Table */}
                <div className="overflow-x-auto rounded border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Code</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Created At</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {toefls.length > 0 ? (
                                toefls.map((toefl) => (
                                    <>
                                        {/* MAIN ROW */}
                                        <tr
                                            key={toefl.id}
                                            onClick={() => handleToggleRow(toefl.id)}
                                            className="cursor-pointer border-t hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3">{toefl.name}</td>
                                            <td className="px-4 py-3">{toefl.code}</td>
                                            <td className="px-2 py-2 text-white">
                                                <p
                                                    className={
                                                        toefl.status === 'active'
                                                            ? 'w-max rounded-full bg-green-700/80 px-2 py-1'
                                                            : 'w-max rounded-full bg-red-600/80 px-2 py-1'
                                                    }
                                                >
                                                    {toefl.status}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">{new Date(toefl.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    onClick={() => handleRoute('edit', toefl.id)}
                                                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                                                >
                                                    Edit
                                                </Button>
                                                &nbsp;
                                                <Button
                                                    onClick={() => handleRoute('delete', toefl.id)}
                                                    className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-700"
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>

                                        {/* DETAIL ROW */}
                                        {expandedId === toefl.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="px-6 py-4">
                                                    {loadingId === toefl.id ? (
                                                        <p className="text-sm text-gray-500">Loading subtest configuration...</p>
                                                    ) : (
                                                        <div>
                                                            <h4 className="mb-2 text-sm font-semibold">Subtest Configuration</h4>

                                                            {details[toefl.id]?.subtests?.length ? (
                                                                <table className="w-full text-sm">
                                                                    <thead className="bg-gray-100">
                                                                        <tr>
                                                                            <th className="px-3 py-2 text-left">Order</th>
                                                                            <th className="px-3 py-2 text-left">Subtest</th>
                                                                            <th className="px-3 py-2 text-left">Duration (minutes)</th>
                                                                            <th className="px-3 py-2 text-left">Max Score</th>
                                                                            <th className="px-3 py-2 text-left">Total Question</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {details[toefl.id].subtests.map((subtest) => (
                                                                            <tr key={subtest.id} className="border-t">
                                                                                <td className="px-3 py-2">{subtest.pivot.order}</td>
                                                                                <td className="px-3 py-2">{subtest.name}</td>
                                                                                <td className="px-3 py-2">{subtest.pivot.duration_minutes}</td>
                                                                                <td className="px-3 py-2">{subtest.pivot.passing_score}</td>
                                                                                <td className="px-3 py-2">{subtest.pivot.total_questions}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <p className="text-sm text-gray-500">No subtest configured.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </>
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
