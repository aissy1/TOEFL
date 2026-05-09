import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Award, BarChart3, BookOpen, Home, TrendingUp } from 'lucide-react';

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
    resultAttempt: ResultAttempt;
}

const colorList = ['blue', 'green', 'purple', 'orange'] as const;
type Color = (typeof colorList)[number];

const colorMap: Record<Color, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
};

const iconList = [BookOpen, TrendingUp, BarChart3, Award];

export default function Scoreboard() {
    const { props } = usePage<SharedData & ScoreData>();
    const { username, result = [] } = props as unknown as ScoreData;

    // Hitung total hanya dari score yang sudah complete
    const totalScore = result.reduce((sum, item) => sum + (item.raw_score ?? 0), 0);
    const maxTotalScore = result.reduce((sum, item) => sum + item.passing_score, 0);

    // Cek apakah masih ada yang pending (essay AES)
    const hasPending = result.some((item) => item.score_status === 'pending');

    const progressWidth = (score: number, max: number) => {
        if (!max) return 0;
        return Math.min((score / max) * 100, 100);
    };

    const getScoreLevel = (score: number, max: number) => {
        const percentage = (score / max) * 100;
        if (percentage >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
        if (percentage >= 80) return { level: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
        if (percentage >= 70) return { level: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        if (percentage >= 60) return { level: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-100' };
        return { level: 'Need Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
    };

    const getTotalScoreLevel = () => {
        const percentage = (totalScore / maxTotalScore) * 100;
        if (percentage >= 90) return { level: 'Outstanding', color: 'text-green-600', bgColor: 'bg-green-100' };
        if (percentage >= 80) return { level: 'Excellent', color: 'text-blue-600', bgColor: 'bg-blue-100' };
        if (percentage >= 70) return { level: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        if (percentage >= 60) return { level: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-100' };
        return { level: 'Need Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
    };

    const overallLevel = getTotalScoreLevel();

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
                                    {username ? `Results for ${username}` : 'Your Test Results'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-2 text-6xl font-bold">
                                    {hasPending ? <span className="text-4xl italic opacity-80">Calculating...</span> : totalScore}
                                </div>
                                <div className="mb-4 text-xl">out of {maxTotalScore}</div>
                                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/20 px-4 py-2">
                                    <span className="font-semibold text-white">{hasPending ? 'Awaiting essay score' : overallLevel.level}</span>
                                </div>
                                <div className="mt-4 h-3 rounded-full bg-white/20">
                                    <div
                                        className="h-3 rounded-full bg-white transition-all duration-1000 ease-out"
                                        style={{ width: `${progressWidth(totalScore, maxTotalScore)}%` }}
                                    ></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section Scores Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {result.map((item, index) => {
                                const Icon = iconList[index % iconList.length];
                                const color = colorList[index % colorList.length];
                                const isPending = item.score_status === 'pending';
                                const score = item.raw_score ?? 0;
                                const level = getScoreLevel(score, item.passing_score);

                                return (
                                    <Card key={item.id} className="border-0 shadow-lg transition-shadow hover:shadow-xl">
                                        <CardHeader>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-5 w-5 text-gray-500" />
                                                <CardTitle className="text-lg">{item.subtest.name}</CardTitle>
                                            </div>
                                            <div className="flex justify-end gap-1">
                                                {item.subtest.name === 'essay' ? (
                                                    <div className="text-gray-400 italic">Pending...</div>
                                                ) : (
                                                    <>
                                                        <div className="text-xl font-bold text-gray-800">{score}</div>
                                                        <span className="text-gray-400">/</span>
                                                        <div className="text-xl text-gray-500">{item.passing_score}</div>
                                                    </>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="h-2 rounded-full bg-gray-200">
                                                    <div
                                                        className={`bg-gradient-to-r ${colorMap[color]} h-2 rounded-full transition-all duration-1000 ease-out`}
                                                        style={{
                                                            width: isPending ? '0%' : `${progressWidth(score, item.passing_score)}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                {isPending ? (
                                                    <div className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-600">
                                                        ⏳ Sedang diproses
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${level.bgColor} ${level.color}`}
                                                    >
                                                        {level.level}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                <Link href="/reset-test" method="post">
                                    <Home className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
