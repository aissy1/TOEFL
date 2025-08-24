import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Award, BarChart3, BookOpen, Download, Home, RotateCcw, TrendingUp } from 'lucide-react';

interface ScoreData {
    username?: string;
    readingScore: number;
    listeningScore: number;
    speakingScore: number;
    writingScore: number;
}

export default function Scoreboard() {
    const { auth } = usePage<SharedData>().props;
    const { props } = usePage();
    const { username, readingScore = 0, listeningScore = 0, speakingScore = 0, writingScore = 0 } = props as unknown as ScoreData;

    const totalScore = readingScore + listeningScore + speakingScore + writingScore;
    const maxScore = 30;
    const maxTotalScore = maxScore * 4;

    const progressWidth = (score: number) => {
        return Math.min((score / maxScore) * 100, 100);
    };

    const getScoreLevel = (score: number) => {
        const percentage = (score / maxScore) * 100;
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

    const sections = [
        { name: 'Reading', score: readingScore, icon: BookOpen, color: 'blue' },
        { name: 'Listening', score: listeningScore, icon: TrendingUp, color: 'green' },
        { name: 'Speaking', score: speakingScore, icon: BarChart3, color: 'purple' },
        { name: 'Writing', score: writingScore, icon: Award, color: 'orange' },
    ];

    const overallLevel = getTotalScoreLevel();

    return (
        <>
            <Head title="Test Results - TOEFL Scoreboard">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                            <Award className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-800">TOEFL Test Results</h1>
                        <p className="text-gray-600">Congratulations on completing your TOEFL practice test!</p>
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
                                <div className="mb-2 text-6xl font-bold">{totalScore}</div>
                                <div className="mb-4 text-xl">out of {maxTotalScore}</div>
                                <div className={`inline-flex items-center rounded-full border border-white/20 bg-white/20 px-4 py-2`}>
                                    <span className="font-semibold text-white">{overallLevel.level}</span>
                                </div>
                                <div className="mt-4 h-3 rounded-full bg-white/20">
                                    <div
                                        className="h-3 rounded-full bg-white transition-all duration-1000 ease-out"
                                        style={{ width: `${(totalScore / maxTotalScore) * 100}%` }}
                                    ></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section Scores Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                const level = getScoreLevel(section.score);
                                const colorMap = {
                                    blue: 'from-blue-500 to-blue-600',
                                    green: 'from-green-500 to-green-600',
                                    purple: 'from-purple-500 to-purple-600',
                                    orange: 'from-orange-500 to-orange-600',
                                };

                                return (
                                    <Card key={section.name} className="border-0 shadow-lg transition-shadow hover:shadow-xl">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className={`h-10 w-10 bg-gradient-to-r ${colorMap[section.color as keyof typeof colorMap]} flex items-center justify-center rounded-lg`}
                                                >
                                                    <Icon className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-800">{section.score}</div>
                                                    <div className="text-sm text-gray-500">/ {maxScore}</div>
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg">{section.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="h-2 rounded-full bg-gray-200">
                                                    <div
                                                        className={`bg-gradient-to-r ${colorMap[section.color as keyof typeof colorMap]} h-2 rounded-full transition-all duration-1000 ease-out`}
                                                        style={{ width: `${progressWidth(section.score)}%` }}
                                                    ></div>
                                                </div>
                                                <div
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${level.bgColor} ${level.color}`}
                                                >
                                                    {level.level}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Performance Insights */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    Performance Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h4 className="mb-2 font-semibold text-gray-800">Strengths</h4>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            {sections
                                                .filter((s) => s.score >= maxScore * 0.7)
                                                .map((s) => (
                                                    <li key={s.name} className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                        {s.name} - {s.score} points
                                                    </li>
                                                ))}
                                            {sections.filter((s) => s.score >= maxScore * 0.7).length === 0 && (
                                                <li className="text-gray-500 italic">Keep practicing to improve your scores!</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 font-semibold text-gray-800">Areas for Improvement</h4>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            {sections
                                                .filter((s) => s.score < maxScore * 0.7)
                                                .map((s) => (
                                                    <li key={s.name} className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                                        {s.name} - Focus on practice
                                                    </li>
                                                ))}
                                            {sections.filter((s) => s.score < maxScore * 0.7).length === 0 && (
                                                <li className="text-gray-500 italic">Excellent performance across all sections!</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4 pt-6">
                            <Button
                                asChild
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/test/reading">
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Take Another Test
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => window.print()}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Results
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
