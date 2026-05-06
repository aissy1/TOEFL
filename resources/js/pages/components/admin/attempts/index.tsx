import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BookCheckIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Toefl Test Attempts',
        href: '/admin/attempts',
    },
];

interface ToeflAttempt {
    id: number;
    name: string;
    code: string;
}

export default function TestAttemptsIndex({ toefls }: { toefls: ToeflAttempt[] }) {
    const handleRoute = (mode: 'view', id?: number) => {
        switch (mode) {
            case 'view':
                router.visit(`/admin/attempts/toefl/${id}`);
                break;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Attempts" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <PageHeader title="Test Attempts" icon={<BookCheckIcon size={20} />}></PageHeader>
                <div className="overflow-x-auto rounded border bg-white">
                    <table className="w-full table-fixed text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-center">Toefl</th>
                                <th className="px-4 py-3 text-center">Code</th>
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
                                return (
                                    <>
                                        {/* TOEFL ROW */}
                                        <tr key={toefl.id} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{toefl.name}</td>
                                            <td className="px-4 py-3 text-center">{toefl.code}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Button onClick={() => handleRoute('view', toefl.id)} variant="link" className="hover:text-blue-600">
                                                    View
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
