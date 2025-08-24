import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Props } from '@/types';
import { useForm } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import NavigatorBox from '../layouts/navigator-question';
import TextToSpeech from '../utils/TextToSpeech';

const ListeningQuestion = forwardRef(function ListeningQuestion({ onComplete, section, questions }: Props, ref) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        currentIndex: 0,
        currentQuestionIndex: 0,
        score: 0,
        section: section,
    });

    const [flagged, setFlag] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [message, setMessage] = useState('');

    const handleButtonDialog = () => {
        const unansweredQuestions = flatQuestions.filter((q) => !data.answers[q.id]);
        if (unansweredQuestions.length > 0) {
            setMessage(`You have ${unansweredQuestions.length} unanswered questions. Do you want to submit and proceed to the next section ?`);
        } else {
            setMessage('Do you really want to submit and proceed to the next section ?');
        }
        setOpenDialog(false);
        setMessage('');
    };

    const flatQuestions = (questions as any[]).flatMap((listening: any) =>
        listening.questions.map((q: any) => ({ ...q, listeningId: listening.id })),
    );

    const currentQuestion = flatQuestions[data.currentQuestionIndex];
    const currentListening = questions.find((r) => r.id === currentQuestion?.listeningId);

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
            // Last question → tampilkan dialog konfirmasi
            const unansweredQuestions = flatQuestions.filter((q) => !data.answers[q.id]);
            if (unansweredQuestions.length > 0) {
                setMessage(`You have ${unansweredQuestions.length} unanswered questions. Do you want to submit and proceed to the next section?`);
            } else {
                setMessage('Do you really want to submit and proceed to the next section?');
            }
            setOpenDialog(true);
        }
    };

    const calculateScore = () => {
        let score = 0;
        (questions as any[]).forEach((listening: any) =>
            listening.questions.forEach((q: any) => {
                const userAnswer = data.answers[q.id];
                const correctAnswer = q.correctAnswer;

                if (userAnswer?.trim().toUpperCase() === correctAnswer.trim().toUpperCase()) {
                    score++;
                }
            }),
        );
        return (score / flatQuestions.length) * 30;
    };

    const handleSubmit = async () => {
        if (isSubmitting) return; // Prevent double submission

        setIsSubmitting(true);

        try {
            const calculatedScore = calculateScore();

            // Update score in form data
            setData('score', calculatedScore);

            // Submit to backend
            post('/submit-test');

            // Call onComplete to move to next section
            onComplete();
        } catch (error) {
            console.error('Error submitting test:', error);
            setIsSubmitting(false);
        }
    };

    // Expose handleSubmit to parent component (for timer expiry)
    useImperativeHandle(ref, () => ({
        handleSubmit,
    }));

    // Check if all questions are answered
    const allQuestionsAnswered = flatQuestions.every((q) => data.answers[q.id]);

    // Get progress percentage
    const answeredCount = Object.keys(data.answers).length;
    const progressPercentage = (answeredCount / flatQuestions.length) * 100;

    const propsNavigator = {
        props: data,
        setData: setData,
        sectionQuestions: questions,
        onComplete: onComplete,
        handleSubmit: handleSubmit,
        flagged: flagged,
    };

    // Loading state or error handling
    if (!currentQuestion || !currentListening) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600">Loading questions...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full items-start justify-between gap-8">
            <NavigatorBox propsNav={propsNavigator} />

            {/* Audio/Passage Section */}
            <div className="max-h-[85vh] w-100 flex-1 space-y-4 overflow-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{currentListening.title}</h2>
                    <div className="text-sm text-gray-500">
                        Question {data.currentQuestionIndex + 1} of {flatQuestions.length}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                </div>

                {/* Important notice */}
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        <p className="text-sm font-medium text-yellow-800">Important: You can only play the audio once. Listen carefully!</p>
                    </div>
                </div>

                {/* Audio Player */}
                <div className="rounded-lg bg-gray-50 p-6">
                    <TextToSpeech text={(currentListening as any).audioScript} />
                </div>
            </div>

            {/* Questions Section */}
            <div className="max-h-[100vh] w-1/3">
                <div className="max-h-[80vh] flex-1 space-y-4 overflow-auto rounded-t-lg border border-gray-200 bg-white p-6 shadow-lg">
                    <div key={currentQuestion.id} className="flex flex-col gap-4">
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-4">
                            <p className="flex-1 text-sm leading-relaxed text-gray-700">
                                <span className="font-semibold text-blue-600">Q{currentQuestion.id}.</span> {currentQuestion.question}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleFlag(currentQuestion.id)}
                                className={`flex-shrink-0 ${flagged[currentQuestion.id] ? 'border-red-500 bg-red-50' : ''}`}
                            >
                                {flagged[currentQuestion.id] ? (
                                    <FlagOff className="h-4 w-4 text-red-600" />
                                ) : (
                                    <Flag className="h-4 w-4 text-gray-500" />
                                )}
                            </Button>
                        </div>

                        {/* Answer Choices */}
                        <div className="space-y-3">
                            {currentQuestion.choices.map((choice: string, index: number) => (
                                <label
                                    key={index}
                                    className={`block cursor-pointer rounded-lg border-2 px-4 py-3 transition-all duration-200 hover:shadow-md ${
                                        data.answers[currentQuestion.id] === choice
                                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion.id}`}
                                            value={choice}
                                            checked={data.answers[currentQuestion.id] === choice}
                                            onChange={() =>
                                                setData('answers', {
                                                    ...data.answers,
                                                    [currentQuestion.id]: choice,
                                                })
                                            }
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <span className="min-w-[20px] font-semibold text-blue-600">{String.fromCharCode(65 + index)}.</span>
                                        <span className="text-gray-700">{choice}</span>
                                    </div>
                                </label>
                            ))}
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

                            <div className="text-xs text-gray-500">
                                {answeredCount} of {flatQuestions.length} answered
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
                                        {data.currentQuestionIndex === flatQuestions.length - 1 ? 'Finish Section' : 'Next'}
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
                            <div className="mt-3 rounded border border-green-200 bg-green-50 p-2 text-center">
                                <p className="text-sm text-green-700">✓ All questions answered! Ready to submit.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent
                    className="max-w-md"
                    onInteractOutside={(event) => {
                        event.preventDefault();
                        handleButtonDialog();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <span>Section Status</span>
                        </DialogTitle>
                        <DialogDescription className="leading-relaxed text-gray-600">{message}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenDialog(false)} // Cancel
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={() => {
                                setOpenDialog(false);
                                handleSubmit(); // Submit & next section
                            }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
});

export default ListeningQuestion;
