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
    const { 
        username, 
        readingScore = 0, 
        listeningScore = 0, 
        speakingScore = 0, 
        writingScore = 0 
    } = props as unknown as ScoreData;

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
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">TOEFL Test Results</h1>
                        <p className="text-gray-600">Congratulations on completing your TOEFL practice test!</p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Overall Score Card */}
                        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-xl font-bold">Overall Score</CardTitle>
                                <CardDescription className="text-blue-100">
                                    {username ? `Results for ${username}` : 'Your Test Results'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-6xl font-bold mb-2">{totalScore}</div>
                                <div className="text-xl mb-4">out of {maxTotalScore}</div>
                                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-white/20 border border-white/20`}>
                                    <span className="text-white font-semibold">{overallLevel.level}</span>
                                </div>
                                <div className="mt-4 bg-white/20 rounded-full h-3">
                                    <div 
                                        className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(totalScore / maxTotalScore) * 100}%` }}
                                    ></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section Scores Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                    <Card key={section.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className={`w-10 h-10 bg-gradient-to-r ${colorMap[section.color as keyof typeof colorMap]} rounded-lg flex items-center justify-center`}>
                                                    <Icon className="w-5 h-5 text-white" />
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
                                                <div className="bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`bg-gradient-to-r ${colorMap[section.color as keyof typeof colorMap]} h-2 rounded-full transition-all duration-1000 ease-out`}
                                                        style={{ width: `${progressWidth(section.score)}%` }}
                                                    ></div>
                                                </div>
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${level.bgColor} ${level.color}`}>
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
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    Performance Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Strengths</h4>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            {sections
                                                .filter(s => s.score >= maxScore * 0.7)
                                                .map(s => (
                                                    <li key={s.name} className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        {s.name} - {s.score} points
                                                    </li>
                                                ))
                                            }
                                            {sections.filter(s => s.score >= maxScore * 0.7).length === 0 && (
                                                <li className="text-gray-500 italic">Keep practicing to improve your scores!</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Areas for Improvement</h4>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            {sections
                                                .filter(s => s.score < maxScore * 0.7)
                                                .map(s => (
                                                    <li key={s.name} className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                        {s.name} - Focus on practice
                                                    </li>
                                                ))
                                            }
                                            {sections.filter(s => s.score < maxScore * 0.7).length === 0 && (
                                                <li className="text-gray-500 italic">Excellent performance across all sections!</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center pt-6">
                            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                <Link href="/dashboard">
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/test/reading">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Take Another Test
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => window.print()}>
                                <Download className="w-4 h-4 mr-2" />
                                Download Results
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
