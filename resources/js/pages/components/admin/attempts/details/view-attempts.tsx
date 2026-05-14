import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { BookCheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Subtest {
    id: number;
    name: string;
    order: number;
    passing_score: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Toefl Test Attempts',
        href: '/admin/attempts',
    },
    {
        title: 'Attempts',
        href: '/admin/attempts',
    },
    {
        title: 'UserAttempts',
        href: '/',
    },
];

interface flash {
    success?: string | null;
    error?: string | null;
}

interface user {
    name: string;
    email: string;
}

interface Score {
    id: number;
    test_attempt_id: number;
    subtest_id: number;
    raw_score: number;
    scaled_score: number | null;
    created_at: string;
    updated_at: string;
}

interface TestAttempt {
    id: number;
    user_id: number;
    toefl_id: number;
    started_at: string;
    finished_at: string | null;
    scores: Score[];
}

interface Toefl {
    id: number;
    name: string;
    code: string;
    status: string;
}
interface Props {
    flash?: flash;
    user: user;
    results: TestAttempt;
    subtests: Subtest[];
    toefl: Toefl;
    essayAnswers: EssayAnswers[];
    errors?: Record<string, string>;
    name?: string;
}

interface EssayAnswers {
    id: number;
    test_attempt_id: number;
    question: string;
    answer_text: string;
    similarity_score: number | null; // score per number
    content_cosine: number | null;
    grammar_score: number | null;
    manual_score: { expert1: number | null; expert2: number | null } | null;
    final_score_type: 'manual' | 'system' | null;
    word_count: number;
    status: string;
}

export default function ViewAttempts({ user, results, subtests, toefl, essayAnswers }: Props) {
    const [graded, setGrade] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const { flash } = usePage().props as any;

    // Inisialisasi form dengan data essay
    const { data, setData, post, put, processing } = useForm({
        grades: essayAnswers.map((item) => ({
            id: item.id,
            manual_score_expert1: item.manual_score?.expert1 ?? null,
            manual_score_expert2: item.manual_score?.expert2 ?? null,
            final_score_type: item.final_score_type ?? 'manual',
        })),
    });

    const getScoreForSubtest = (subtestId: number): Score | undefined => {
        return results.scores.find((s) => s.subtest_id === subtestId);
    };

    const totalRawScore = results.scores.reduce((sum, s) => sum + (s.raw_score ?? 0), 0);
    const totalMaxScore = results.scores.reduce((sum, s) => {
        const subtest = subtests.find((z) => z.id === s.subtest_id);
        return sum + (subtest ? subtest.passing_score : 0);
    }, 0);

    // Update field per item
    const updateGrade = (index: number, field: string, value: any) => {
        const updated = [...data.grades];
        updated[index] = { ...updated[index], [field]: value };
        setData('grades', updated);
    };

    const handleGradeSystem = () => {
        console.log('Grading by system...');
        post(route('admin.attempts.gradeSystem', { attempt: results.id }), {
            onSuccess: () => {
                router.reload({
                    only: ['essayAnswers'],
                });
            },
            onError: () => {
                toast.error('An error occurred while grading. Please try again.');
            },
        });
    };

    const handleButton = (action: string) => {
        if (disabled && action === 'edit') {
            // Enable editing
            setDisabled(false);
        } else if (!disabled && action === 'cancel') {
            // Reset form to initial values and disable editing
            setData({
                grades: essayAnswers.map((item) => ({
                    id: item.id,
                    manual_score_expert1: item.manual_score?.expert1 ?? null,
                    manual_score_expert2: item.manual_score?.expert2 ?? null,
                    final_score_type: item.final_score_type ?? 'manual',
                })),
            });
            setDisabled(true);
        } else {
            // Submit grades
            put(
                route('admin.attempts.toefl.grade', {
                    id: results.toefl_id,
                    userId: results.user_id,
                    attempt: results.id,
                }),
                {
                    onSuccess: () => {
                        setDisabled(true);
                        router.reload();
                    },
                },
            );
        }
    };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        const hasProcessing = essayAnswers.some((item) => item.status === 'processing');

        const comletedCount = essayAnswers.filter((item) => item.status === 'completed').length;

        if (comletedCount === essayAnswers.length) {
            toast.success('All essay answers have been graded!');
            return;
        }

        if (!hasProcessing) return;

        const interval = setInterval(() => {
            router.reload({
                only: ['essayAnswers'],
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [essayAnswers]);

    useEffect(() => {
        console.log(essayAnswers.map((item) => item.status));
        if (essayAnswers.some((item) => item.status !== 'completed' || null)) {
            // if status aes is not completed or null, then can grade
            setGrade(false);
        } else {
            setGrade(true);
        }
        console.log('Graded state updated:', graded);
    }, [essayAnswers]);

    useEffect(() => {
        setData(
            'grades',
            essayAnswers.map((item) => ({
                id: item.id,
                manual_score_expert1: item.manual_score?.expert1 ?? null,
                manual_score_expert2: item.manual_score?.expert2 ?? null,
                final_score_type: item.final_score_type ?? 'manual',
            })),
        );
    }, [essayAnswers]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Attempts Details" />

            <div className="flex h-full w-full flex-1 flex-col rounded-xl p-4">
                <PageHeader title={`Test Attempts - ${toefl.name}`} icon={<BookCheckIcon size={20} />} />
                <p className="mb-2 text-sm text-gray-500">
                    Attempt ID: #{results.id} &nbsp;|&nbsp; Started: {new Date(results.started_at).toLocaleString()}
                </p>

                {/* Total Score Card */}
                <div className="mb-6 flex justify-around rounded-lg bg-blue-50 p-5 shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Username</p>
                        <h2 className="mt-1 text-3xl font-bold text-blue-700">{user.name}</h2>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <h2 className="mt-1 text-3xl font-bold text-blue-700">{user.email}</h2>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Score</p>
                        <h2 className="mt-1 text-3xl font-bold text-blue-700">
                            {totalRawScore}
                            <span className="ml-2 text-lg font-normal text-gray-500">/ {totalMaxScore}</span>
                        </h2>
                    </div>
                </div>

                {/* Subtests */}
                <div className="mb-4">
                    <h3 className="text-xl font-semibold">Subtest Scores</h3>
                </div>
                <div className="grid grid-cols-4 grid-rows-1 gap-2">
                    {subtests
                        .sort((a, b) => a.order - b.order)
                        .map((subtest) => {
                            const score = getScoreForSubtest(subtest.id);
                            const rawScore = score?.raw_score ?? '-';
                            return (
                                <div key={subtest.id} className="flex justify-between rounded-lg border bg-white p-4 shadow-sm">
                                    <div className="flex flex-col">
                                        <h4 className="font-semibold text-gray-800">{subtest.name}</h4>
                                        <p className="text-xs text-gray-400">Order #{subtest.order}</p>
                                    </div>
                                    <div className="flex flex-row items-center gap-4 text-right">
                                        <div>
                                            <p className="text-lg font-bold text-blue-600">
                                                {rawScore}/{subtest.passing_score}
                                            </p>
                                            <p className="text-xs text-gray-400">Score</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* Essay Answer Scores */}
                <div className="mt-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Essay Answer</h3>
                        <div className="flex items-center gap-1">
                            {!graded && (
                                <Button
                                    onClick={handleGradeSystem}
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        processing ||
                                        (disabled
                                            ? false
                                            : data.grades.some((g) => g.manual_score_expert1 === null || g.manual_score_expert2 === null))
                                    }
                                >
                                    {processing ? 'Grading...' : 'Grade'}
                                </Button>
                            )}
                            {!disabled && (
                                <Button onClick={() => handleButton('cancel')} variant="destructive" size="sm" disabled={processing}>
                                    Cancel
                                </Button>
                            )}
                            <Button
                                onClick={() => handleButton(disabled ? 'edit' : 'submit')}
                                disabled={processing}
                                variant="outline"
                                size="sm"
                                className={
                                    disabled
                                        ? 'bg-blue-600 text-white hover:bg-blue-800 hover:text-white'
                                        : 'bg-green-500 text-white hover:bg-green-600 hover:text-white'
                                }
                            >
                                {processing && !disabled ? 'Saving...' : disabled ? 'Grade Essay' : 'Submit Grade'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 overflow-x-auto rounded border bg-white p-4 shadow-sm">
                        {essayAnswers.map((item, index) => {
                            const grade = data.grades[index];
                            const systemScore = item.similarity_score ?? 0;

                            return (
                                <div key={item.id} className="flex w-full rounded-lg border p-2">
                                    {/* Left: Question & Answer */}
                                    <div className="w-1/2 px-2">
                                        <p className="font-medium">
                                            <span>Question {index + 1} : </span>
                                            {item.question}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Answer Length : <span>{item.word_count} words</span>
                                        </p>
                                        <p className="mt-2">{item.answer_text}</p>
                                    </div>

                                    {/* Right: Scores */}
                                    <div className="grid w-1/2 grid-cols-2 gap-4">
                                        {/* AES Scores (selalu disabled) */}
                                        <div className="flex flex-col gap-2">
                                            <div>
                                                <p className="text-sm font-medium">Content Similarity Score</p>
                                                <input
                                                    type="number"
                                                    value={item.content_cosine ? (item.content_cosine * 100).toFixed(2) : 0}
                                                    className="w-full rounded border px-2 py-1 text-sm"
                                                    placeholder="Similarity score"
                                                    disabled
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Grammar Scale</p>
                                                <input
                                                    type="number"
                                                    value={item.grammar_score ?? ''}
                                                    className="w-full rounded border px-2 py-1 text-sm"
                                                    placeholder="Grammar score"
                                                    disabled
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        {/* Manual Scores */}
                                        <div className="flex flex-col gap-2">
                                            <div>
                                                <p className="text-sm font-medium">Manual Score 1</p>
                                                <input
                                                    type="number"
                                                    value={grade.manual_score_expert1 ?? ''}
                                                    onChange={(e) =>
                                                        updateGrade(index, 'manual_score_expert1', e.target.value ? Number(e.target.value) : null)
                                                    }
                                                    className="w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
                                                    placeholder="Enter manual score"
                                                    disabled={disabled}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Manual Score 2</p>
                                                <input
                                                    type="number"
                                                    value={grade.manual_score_expert2 ?? ''}
                                                    onChange={(e) =>
                                                        updateGrade(index, 'manual_score_expert2', e.target.value ? Number(e.target.value) : null)
                                                    }
                                                    className="w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
                                                    placeholder="Enter manual score"
                                                    disabled={disabled}
                                                />
                                            </div>
                                        </div>

                                        {/* Final Score */}
                                        <div>
                                            <p className="text-sm font-medium">Final Score</p>
                                            <select
                                                value={grade.final_score_type}
                                                onChange={(e) => updateGrade(index, 'final_score_type', e.target.value)}
                                                className="w-full rounded border px-2 py-1 text-sm disabled:bg-gray-50"
                                                disabled={disabled}
                                            >
                                                <option value="manual">
                                                    Manual -{' '}
                                                    {grade.manual_score_expert1 && grade.manual_score_expert2
                                                        ? ((Number(grade.manual_score_expert1) + Number(grade.manual_score_expert2)) / 2).toFixed(0)
                                                        : 'N/A'}
                                                </option>
                                                <option value="system">System - {systemScore > 0 ? systemScore : 'N/A'}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
