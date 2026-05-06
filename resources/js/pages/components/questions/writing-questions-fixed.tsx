import { Button } from '@/components/ui/button';
import { Props } from '@/types';
import { useForm } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import NavigatorBox from '../layouts/navigator-question';
import SubmissionLoading from '../utils/SubmissionLoading';

const WritingQuestion = forwardRef(function WritingQuestion({ onComplete, section, questions }: Props, ref) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        currentIndex: 0,
        currentQuestionIndex: 0,
        score: 0,
        section: section,
    });

    const [flagged, setFlag] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle both array and single object formats
    const questionsArray = Array.isArray(questions) ? questions : [questions];
    const flatQuestions = questionsArray.flatMap((writing: any) =>
        writing.questions ? writing.questions.map((q: any) => ({ ...q, writingId: writing.id })) : [],
    );

    const currentQuestion = flatQuestions[data.currentQuestionIndex];
    const currentWriting = questionsArray.find((r: any) => r.id === currentQuestion?.writingId);

    // Safety check untuk memastikan currentWriting dan currentQuestion ada
    if (!currentQuestion || !currentWriting) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">No writing questions available</p>
                </div>
            </div>
        );
    }

    const handleAnswerChange = (questionId: number, value: string) => {
        setData('answers', {
            ...data.answers,
            [questionId]: value,
        });
    };

    const toggleFlag = (id: number) => {
        setFlag((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handlePrev = () => {
        if (data.currentQuestionIndex > 0) {
            setData('currentQuestionIndex', data.currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (data.currentQuestionIndex < flatQuestions.length - 1) {
            setData('currentQuestionIndex', data.currentQuestionIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return; // Prevent double submission

        setIsSubmitting(true);

        try {
            const answeredQuestions = flatQuestions.filter((q: any) => data.answers[q.id]?.trim());

            if (answeredQuestions.length === 0) {
                alert('Please answer at least one question before submitting.');
                setIsSubmitting(false);
                return;
            }

            let totalScore = 0;

            // For writing section, we'll use a simple scoring method
            // If API is not available, use word count and basic validation
            for (const q of answeredQuestions) {
                const answer = data.answers[(q as any).id]?.trim();
                if (!answer) continue;

                try {
                    // Try to call the API first
                    const payload = {
                        question: (q as any).question,
                        answer: answer,
                    };

                    const response = await fetch('http://127.0.0.1:5000/assess-writing', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        const score = Number(result.assessment?.score || 0);
                        totalScore += Math.min(score, 30); // Cap at 30
                    } else {
                        // Fallback scoring based on word count and basic criteria
                        const wordCount = answer.split(/\s+/).length;
                        let score = 0;

                        if (wordCount >= 400) score = 25;
                        else if (wordCount >= 300) score = 20;
                        else if (wordCount >= 200) score = 15;
                        else if (wordCount >= 100) score = 10;
                        else score = 5;

                        totalScore += score;
                    }
                } catch (error) {
                    console.error(`Error processing question ${(q as any).id}:`, error);
                    // Fallback scoring
                    const wordCount = answer.split(/\s+/).length;
                    let score = 0;

                    if (wordCount >= 400) score = 25;
                    else if (wordCount >= 300) score = 20;
                    else if (wordCount >= 200) score = 15;
                    else if (wordCount >= 100) score = 10;
                    else score = 5;

                    totalScore += score;
                }
            }

            // Calculate average score if multiple questions
            const finalScore = answeredQuestions.length > 0 ? Math.round(totalScore / answeredQuestions.length) : 0;

            setData('score', Math.min(finalScore, 30)); // Cap at 30
        } catch (error) {
            console.error('Error submitting writing test:', error);
            setIsSubmitting(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleSubmit,
    }));

    useEffect(() => {
        if (data.score !== 0) {
            post('/submit-test');
            onComplete();
        }
    }, [data.score]);

    // Get word count for current answer
    const getCurrentWordCount = () => {
        const answer = data.answers[(currentQuestion as any)?.id] || '';
        return answer
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
    };

    // Check if all questions are answered
    const allQuestionsAnswered = flatQuestions.every((q: any) => data.answers[q.id]?.trim());

    // Get progress percentage
    const answeredCount = Object.keys(data.answers).filter((key) => data.answers[parseInt(key)]?.trim()).length;
    const progressPercentage = (answeredCount / flatQuestions.length) * 100;

    const propsNavigator = {
        props: data,
        setData: setData,
        sectionQuestions: questionsArray,
        onComplete: onComplete,
        handleSubmit: handleSubmit,
        flagged: flagged,
    };

    const currentWordCount = getCurrentWordCount();
    const isMinWordsMet = currentWordCount >= 400;

    return (
        <>
            <SubmissionLoading isVisible={isSubmitting} message="Evaluating your essay and calculating score" />

            <div className="flex w-full items-start justify-between gap-8">
                {/* NAVIGATOR */}
                <NavigatorBox propsNav={propsNavigator} />

                {/* Reading/Prompt BOX */}
                <div className="max-h-[85vh] w-1/3 flex-1 space-y-4 overflow-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <h2 className="text-xl font-bold text-gray-800">{currentWriting.title}</h2>
                        <div className="text-sm text-gray-500">Writing Section</div>
                    </div>

                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="font-semibold text-blue-800">Writing Guidelines</span>
                        </div>
                        <ul className="space-y-1 text-sm text-blue-700">
                            <li>• Minimum 400 words required</li>
                            <li>• Express your opinion clearly</li>
                            <li>• Use examples to support your points</li>
                            <li>• Check grammar and spelling</li>
                        </ul>
                    </div>

                    <div className="prose prose-sm max-w-none">
                        <p className="text-justify leading-relaxed text-gray-700">{(currentWriting as any)?.passage}</p>
                    </div>
                </div>

                {/* Question & Answer Box */}
                <div className="max-h-[100vh] w-1/3">
                    <div className="max-h-[80vh] flex-1 space-y-4 overflow-auto rounded-t-lg border border-gray-200 bg-white p-6 shadow-lg">
                        <div key={(currentQuestion as any)?.id} className="flex flex-col gap-4">
                            <div className="flex justify-between gap-2 border-b border-gray-200 pb-3">
                                <div className="flex-1">
                                    <h3 className="mb-2 font-semibold text-gray-800">Question {data.currentQuestionIndex + 1}</h3>
                                    <p className="text-md leading-relaxed text-gray-700">{(currentQuestion as any)?.question}</p>
                                </div>
                                <Button variant={'outline'} size="sm" onClick={() => toggleFlag((currentQuestion as any)?.id)}>
                                    {flagged[(currentQuestion as any)?.id] ? (
                                        <FlagOff className="h-4 w-4 text-red-600" />
                                    ) : (
                                        <Flag className="h-4 w-4 text-red-600" />
                                    )}
                                </Button>
                            </div>

                            {/* Answer Area */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="answer" className="block font-semibold text-gray-700">
                                        Your Essay
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                isMinWordsMet
                                                    ? 'bg-green-100 text-green-700'
                                                    : currentWordCount > 0
                                                      ? 'bg-yellow-100 text-yellow-700'
                                                      : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {currentWordCount} words
                                        </span>
                                        {isMinWordsMet && <span className="text-xs text-green-600">✓ Min requirement met</span>}
                                    </div>
                                </div>
                                <textarea
                                    id="answer"
                                    key={`question-${(currentQuestion as any)?.id}`}
                                    name={`question-${(currentQuestion as any)?.id}`}
                                    className="min-h-[300px] w-full resize-none rounded-lg border border-gray-300 p-4 text-sm leading-relaxed transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    placeholder="Write your essay here. Express your opinion clearly and support it with specific examples. Remember to aim for at least 400 words..."
                                    value={data.answers[(currentQuestion as any)?.id] || ''}
                                    onChange={(e) => handleAnswerChange((currentQuestion as any)?.id, e.target.value)}
                                />

                                {/* Progress indicator */}
                                <div className="h-1.5 rounded-full bg-gray-200">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-300 ${isMinWordsMet ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min((currentWordCount / 400) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Footer */}
                    <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-lg">
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <Button size="sm" variant="outline" onClick={handlePrev} disabled={data.currentQuestionIndex === 0} className="px-6">
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </Button>

                                <div className="text-center text-xs text-gray-500">
                                    <div>
                                        {answeredCount} of {flatQuestions.length} answered
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Question {data.currentQuestionIndex + 1} of {flatQuestions.length}
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className={`px-6 ${data.currentQuestionIndex === flatQuestions.length - 1 ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="mr-2 -ml-1 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            {data.currentQuestionIndex === flatQuestions.length - 1 ? 'Submit Writing' : 'Next'}
                                            {data.currentQuestionIndex < flatQuestions.length - 1 && (
                                                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Show completion status */}
                            {allQuestionsAnswered && (
                                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                                    <p className="text-sm text-green-700">✓ All questions answered! Ready to submit.</p>
                                </div>
                            )}

                            {/* Word count warning */}
                            {!isMinWordsMet && data.answers[(currentQuestion as any)?.id] && (
                                <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-center">
                                    <p className="text-sm text-yellow-700">
                                        ⚠️ Try to write at least {400 - currentWordCount} more words for a better score.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

export default WritingQuestion;
