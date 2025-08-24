import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Award, BarChart3, BookOpen, Download, Home, TrendingUp } from 'lucide-react';
import { useState } from 'react';

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

    const [isGenerating, setIsGenerating] = useState(false);

    const totalScore = readingScore + listeningScore + speakingScore + writingScore;
    const maxScore = 30;
    const maxTotalScore = maxScore * 4; // Total 120 points

    // Check if all sections are completed (allow 0 scores)
    const allSectionsCompleted = readingScore >= 0 && listeningScore >= 0 && speakingScore >= 0 && writingScore >= 0;

    const generateCertificate = () => {
        setIsGenerating(true);

        // Create certificate content
        const certificateContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>TOEFL Certificate - ${username || 'Student'}</title>
                <style>
                    body {
                        font-family: 'Times New Roman', serif;
                        margin: 0;
                        padding: 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                    }
                    .certificate {
                        background: white;
                        padding: 60px;
                        border-radius: 20px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        text-align: center;
                        max-width: 800px;
                        margin: 0 auto;
                        border: 8px solid #f8f9fa;
                        position: relative;
                    }
                    .certificate::before {
                        content: '';
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        right: 20px;
                        bottom: 20px;
                        border: 3px solid #6366f1;
                        border-radius: 15px;
                    }
                    .header {
                        margin-bottom: 40px;
                    }
                    .title {
                        font-size: 48px;
                        font-weight: bold;
                        color: #1e40af;
                        margin-bottom: 10px;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                    }
                    .subtitle {
                        font-size: 24px;
                        color: #6b7280;
                        margin-bottom: 40px;
                    }
                    .recipient {
                        font-size: 32px;
                        color: #1f2937;
                        margin: 30px 0;
                        font-weight: bold;
                    }
                    .scores {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        margin: 40px 0;
                        text-align: left;
                    }
                    .score-item {
                        background: #f8fafc;
                        padding: 20px;
                        border-radius: 10px;
                        border-left: 5px solid #6366f1;
                    }
                    .score-label {
                        font-size: 16px;
                        color: #6b7280;
                        margin-bottom: 5px;
                    }
                    .score-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1f2937;
                    }
                    .total-score {
                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                        color: white;
                        padding: 30px;
                        border-radius: 15px;
                        margin: 40px 0;
                    }
                    .total-score h3 {
                        margin: 0 0 10px 0;
                        font-size: 24px;
                    }
                    .total-score .score {
                        font-size: 48px;
                        font-weight: bold;
                        margin: 0;
                    }
                    .date {
                        font-size: 18px;
                        color: #6b7280;
                        margin-top: 40px;
                    }
                    .footer {
                        margin-top: 40px;
                        border-top: 2px solid #e5e7eb;
                        padding-top: 20px;
                    }
                    .watermark {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-45deg);
                        font-size: 120px;
                        color: rgba(99, 102, 241, 0.05);
                        font-weight: bold;
                        z-index: 0;
                        pointer-events: none;
                    }
                    .content {
                        position: relative;
                        z-index: 1;
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="watermark">TOEFL</div>
                    <div class="content">
                        <div class="header">
                            <h1 class="title">CERTIFICATE</h1>
                            <p class="subtitle">Test of English as a Foreign Language</p>
                        </div>
                        
                        <p style="font-size: 20px; color: #6b7280; margin: 20px 0;">This is to certify that</p>
                        <div class="recipient">${username || 'Student'}</div>
                        <p style="font-size: 18px; color: #6b7280; margin: 20px 0;">has successfully completed the TOEFL Practice Test</p>
                        
                        <div class="total-score">
                            <h3>Total Score</h3>
                            <p class="score">${totalScore}/120</p>
                        </div>
                        
                        <div class="scores">
                            <div class="score-item">
                                <div class="score-label">Reading</div>
                                <div class="score-value">${readingScore}/30</div>
                            </div>
                            <div class="score-item">
                                <div class="score-label">Listening</div>
                                <div class="score-value">${listeningScore}/30</div>
                            </div>
                            <div class="score-item">
                                <div class="score-label">Speaking</div>
                                <div class="score-value">${speakingScore}/30</div>
                            </div>
                            <div class="score-item">
                                <div class="score-label">Writing</div>
                                <div class="score-value">${writingScore}/30</div>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <div class="date">Completed on ${new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}</div>
                            <p style="font-size: 14px; color: #9ca3af; margin-top: 20px;">
                                This certificate is issued for practice purposes only and does not represent an official TOEFL score.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Create and download the certificate
        const blob = new Blob([certificateContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `TOEFL_Certificate_${username || 'Student'}_${new Date().getTime()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsGenerating(false);
    };

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

                        {/* Completion Status */}
                        <Card className="border-l-4 border-l-green-500 bg-green-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                        <Award className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-green-800">Test Completed!</h3>
                                        <p className="text-sm text-green-700">
                                            Your test results are ready. You can download your certificate below.
                                        </p>
                                    </div>
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
                                <Link href="/reset-test" method="post">
                                    <Home className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" onClick={generateCertificate} disabled={isGenerating}>
                                {isGenerating ? (
                                    <>
                                        <svg className="mr-2 -ml-1 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Certificate
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
