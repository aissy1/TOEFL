import PageHeader from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BookOpen, ClipboardList, FileText, Gauge, Layers, ListChecks, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface Summary {
    total_toefls: number;
    active_toefls: number;
    total_subtests: number;
    total_questions: number;
    total_passages: number;
    total_attempts: number;
    total_users: number;
}

interface DashboardSubtest {
    id: number;
    name: string;
    slug: string;
    order: number;
    duration_minutes: number;
    total_questions: number;
    seeded_questions: number;
    passing_score: number;
}

interface DashboardToefl {
    id: number;
    name: string;
    code: string;
    status: string;
    toefl_subtests_count: number;
    seeded_questions: number;
    expected_questions: number;
    completion_rate: number;
    subtests: DashboardSubtest[];
}

interface MasterSubtest {
    id: number;
    name: string;
    slug: string;
    order: number;
    questions_count: number;
    toefl_subtests_count: number;
}

interface QuestionType {
    question_type: string;
    total: number;
}

interface DashboardProps {
    summary: Summary;
    toefls: DashboardToefl[];
    subtests: MasterSubtest[];
    questionTypes: QuestionType[];
}

const statCards = [
    { key: 'total_toefls', label: 'TOEFL Packets', icon: BookOpen },
    { key: 'active_toefls', label: 'Active Packets', icon: Gauge },
    { key: 'total_subtests', label: 'Master Subtests', icon: Layers },
    { key: 'total_questions', label: 'Question Bank', icon: ClipboardList },
    { key: 'total_passages', label: 'Passages', icon: FileText },
    { key: 'total_attempts', label: 'Attempts', icon: ListChecks },
    { key: 'total_users', label: 'Users', icon: Users },
] as const;

function StatusBadge({ status }: { status: string }) {
    const isActive = status === 'active';

    return (
        <span
            className={
                isActive
                    ? 'rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700'
                    : 'rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700'
            }
        >
            {status}
        </span>
    );
}

export default function AdminDashboard({ summary, toefls, subtests, questionTypes }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <PageHeader title="Dashboard Admin" icon={<Gauge size={20} />} />

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.key} className="rounded border bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-gray-500">{item.label}</p>
                                        <p className="mt-1 text-2xl font-semibold text-gray-900">{summary[item.key].toLocaleString('id-ID')}</p>
                                    </div>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                                        <Icon size={20} />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
                    <div className="rounded border bg-white">
                        <div className="border-b px-4 py-3">
                            <h2 className="text-base font-semibold text-gray-800">Packet TOEFL</h2>
                            <p className="text-sm text-gray-500">Package summary, question progress, and subtest configuration.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Packet</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-center">Subtest</th>
                                        <th className="px-4 py-3 text-center">Questions</th>
                                        <th className="px-4 py-3 text-center">Progres</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {toefls.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                                No TOEFL packets available.
                                            </td>
                                        </tr>
                                    )}

                                    {toefls.map((toefl) => (
                                        <tr key={toefl.id} className="border-t align-top">
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => router.visit(`/admin/toefl/edit/${toefl.id}`)}
                                                    className="font-medium text-blue-700 hover:underline"
                                                >
                                                    {toefl.name}
                                                </button>
                                                <div className="mt-1 text-xs text-gray-500">{toefl.code}</div>
                                                <div className="mt-3 space-y-1">
                                                    {toefl.subtests.map((subtest) => (
                                                        <div
                                                            key={subtest.id}
                                                            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600"
                                                        >
                                                            <span className="font-medium text-gray-800">
                                                                {subtest.order}. {subtest.name}
                                                            </span>
                                                            <span>{subtest.duration_minutes} minutes</span>
                                                            <span>
                                                                {subtest.seeded_questions}/{subtest.total_questions} questions
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={toefl.status} />
                                            </td>
                                            <td className="px-4 py-3 text-center">{toefl.toefl_subtests_count}</td>
                                            <td className="px-4 py-3 text-center">
                                                {toefl.seeded_questions}/{toefl.expected_questions}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="mx-auto w-28">
                                                    <div className="mb-1 text-center text-xs text-gray-600">{toefl.completion_rate}%</div>
                                                    <div className="h-2 rounded-full bg-gray-100">
                                                        <div
                                                            className="h-2 rounded-full bg-blue-600"
                                                            style={{ width: `${Math.min(toefl.completion_rate, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded border bg-white">
                            <div className="border-b px-4 py-3">
                                <h2 className="text-base font-semibold text-gray-800">Master Subtest</h2>
                            </div>
                            <div className="divide-y">
                                {subtests.map((subtest) => (
                                    <div key={subtest.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                                        <div>
                                            <p className="font-medium text-gray-800">{subtest.name}</p>
                                            <p className="text-xs text-gray-500">{subtest.slug}</p>
                                        </div>
                                        <div className="text-right text-xs text-gray-500">
                                            <p>{subtest.questions_count} questions</p>
                                            <p>{subtest.toefl_subtests_count} packets</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded border bg-white">
                            <div className="border-b px-4 py-3">
                                <h2 className="text-base font-semibold text-gray-800">Question Types</h2>
                            </div>
                            <div className="divide-y">
                                {questionTypes.length === 0 && <p className="px-4 py-4 text-sm text-gray-500">No questions available.</p>}
                                {questionTypes.map((item) => (
                                    <div key={item.question_type} className="flex items-center justify-between px-4 py-3 text-sm">
                                        <span className="text-gray-700 capitalize">{item.question_type.replace('_', ' ')}</span>
                                        <span className="font-semibold text-gray-900">{item.total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
