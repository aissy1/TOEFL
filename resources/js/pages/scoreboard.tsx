import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Award, BarChart3, BookOpen, TrendingUp } from 'lucide-react';

interface Subtest {
    id: number;
    name: string;
    slug: string;
    order: number;
}

interface result {
    id: number;
    toefl_id: number;
    subtest_id: number;
    order: number;
    duration_minutes: number;
    total_questions: number;
    passing_score: number;
    subtest: Subtest;
    raw_score: number | null;
    scaled_score: number | null;
    score_status: 'complete' | 'pending';
}

interface ResultAttempt {
    id: number;
    toefl_id: number;
    user_id: number;
    started_at: string;
    finished_at: string | null;
}

interface ScoreData {
    username: string;
    result: result[];
    essay_score: number;
    scale_cefr: string | null;
    resultAttempt: ResultAttempt;
}

const colorList = ['blue', 'orange', 'purple', 'green'] as const;
type Color = (typeof colorList)[number];

const colorMap: Record<Color, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
};

const iconList = [BookOpen, TrendingUp, BarChart3, Award];

export default function Scoreboard() {
    const { props } = usePage<SharedData & ScoreData>();
    const { username, result = [], essay_score, scale_cefr } = props as unknown as ScoreData;

    const totalSubtest = result.reduce((sum, item) => sum + (item.scaled_score !== null ? 1 : 0), 0);

    // Hitung total hanya dari score yang sudah complete
    const totalScore = result.reduce((sum, item) => sum + (item.scaled_score !== null ? Math.round((item.scaled_score / totalSubtest) * 10) : 0), 0);
    const maxTotalScore = result.reduce((sum, item) => sum + item.passing_score, 0);

    // Cek apakah masih ada yang pending (essay AES)
    const hasPending = essay_score === null;

    const progressWidth = (score: number, max: number) => {
        if (!max) return 0;
        const percentage = (score / max) * 100;

        return Math.max(0, Math.min(percentage, 100));
    };

    const getLabelCefr = (scale_cefr: string | null) => {
        switch (scale_cefr) {
            case 'C2':
                return { scale_cefr: 'C2', level: 'Proficient' };
            case 'C1':
                return { scale_cefr: 'C1', level: 'Advanced' };
            case 'B2':
                return { scale_cefr: 'B2', level: 'Upper-Intermediate' };
            case 'B1':
                return { scale_cefr: 'B1', level: 'Intermediate' };
            case 'A2':
                return { scale_cefr: 'A2', level: 'Elementary' };
            case 'A1':
                return { scale_cefr: 'A1', level: 'Beginner' };
            default:
                return { scale_cefr: scale_cefr, level: scale_cefr };
        }
    };

    const resetTest = () => {
        router.post('/reset-test', { replace: true });
    };

    return (
        <>
            <Head title="Scoreboard">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-4 text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                            <Award className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-800">Test Results</h1>
                        <p className="text-gray-600">Congratulations on completing your Test English!</p>
                    </div>

                    <div className="mx-auto max-w-4xl space-y-6">
                        {/* Overall Score Card */}
                        <Card className="border-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
                            <CardHeader className="pb-2 text-center">
                                <CardTitle className="text-xl font-bold">Overall Score</CardTitle>
                                <CardDescription className="text-blue-100">
                                    {username ? `Results for ${username} without essay score` : 'Your Test Results'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-2 text-6xl font-bold">{totalScore}</div>
                                <div className="mt-4 h-3 rounded-full bg-white/20">
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-purple-100">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-300 shadow-[0_0_12px_rgba(125,211,252,.5)] transition-all duration-1000"
                                            style={{ width: `${progressWidth(totalScore, maxTotalScore)}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Essay Scores Grid */}
                        <Card className="border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl">
                            <CardHeader className="pb-2 text-center">
                                <CardTitle className="text-xl font-bold">Essay Score</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-2 text-6xl font-bold">
                                    {hasPending ? <span className="text-4xl italic opacity-80">Calculating...</span> : essay_score}
                                </div>
                                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/20 px-4 py-2">
                                    <span className="font-semibold text-white">
                                        {hasPending
                                            ? 'Awaiting essay score'
                                            : getLabelCefr(scale_cefr).scale_cefr + ' - ' + getLabelCefr(scale_cefr).level}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section Scores Grid */}
                        <div className="grid gap-4 lg:grid-cols-3">
                            {result.map((item, index) => {
                                const Icon = iconList[index % iconList.length];
                                const color = colorList[index % colorList.length];

                                return (
                                    item.subtest.name !== 'essay' && (
                                        <Card key={item.id} className="border-0 shadow-lg transition-shadow hover:shadow-xl">
                                            <CardHeader>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-5 w-5 text-gray-500" />
                                                    <CardTitle className="text-lg">{item.subtest.name}</CardTitle>
                                                </div>
                                                <div className="flex justify-center gap-1">
                                                    <div className="text-xl font-bold text-gray-800">{item.scaled_score}</div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="h-2 rounded-full bg-gray-200">
                                                        <div
                                                            className={`bg-gradient-to-r ${colorMap[color]} h-2 w-full rounded-full transition-all duration-1000 ease-out`}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                onClick={() => {
                                    resetTest();
                                }}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
