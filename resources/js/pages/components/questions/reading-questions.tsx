import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Props } from '@/types';
import { useForm } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import NavigatorBox from '../layouts/navigator-question';

const ReadingQuestion = forwardRef(function ReadingQuestion({ onComplete, section, questions }: Props, ref) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        currentQuestionIndex: 0,
        score: 0,
        section: section,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [flagged, setFlag] = useState<Record<number, boolean>>({}) || false;
    const [openDialog, setOpenDialog] = useState(false);
    const [message, setMessage] = useState('');

    const flatQuestions = (questions as any[]).flatMap((reading: any) => reading.questions.map((q: any) => ({ ...q, readingId: reading.id })));

    const allQuestionsAnswered = flatQuestions.every((q) => data.answers[q.id]);

    const currentQuestion = flatQuestions[data.currentQuestionIndex];
    const currentReading = questions.find((r) => r.id === currentQuestion.readingId)!;

    const toggleFlag = (id: number) => {
        setFlag((prev) => ({ ...prev, [id]: !prev[id] }));
        console.log(flagged);
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

    const answeredCount = Object.keys(data.answers).length;

    const handleSubmit = () => {
        let score = 0;
        // const unansweredQuestions = flatQuestions.filter((q) => !data.answers[q.id]);
        // if (unansweredQuestions.length > 0) {
        //     const confirmed = confirm(`You have ${unansweredQuestions.length} unanswered questions. Do you want to submit anyway?`);
        //     if (!confirmed) return;
        // }

        setIsSubmitting(true);

        flatQuestions.forEach((q) => {
            const userAnswer = data.answers[q.id];
            const correctAnswer = q.correctAnswer;
            if (userAnswer?.trim().toUpperCase() === correctAnswer?.trim().toUpperCase()) {
                score++;
            }
        });

        const finalScore = Math.round((score / flatQuestions.length) * 30);
        console.log(`Reading Score: ${finalScore} (${score}/${flatQuestions.length})`);

        setData('score', finalScore);

        post('/submit-test');

        onComplete();

        setIsSubmitting(false);
    };

    useImperativeHandle(ref, () => ({
        handleSubmit,
    }));

    // useEffect(() => {
    //     if (data.score !== 0) {

    //     }
    // }, [data.score]);

    const propsNavigator = {
        props: data,
        setData: setData,
        sectionQuestions: questions,
        onComplete: onComplete,
        flagged: flagged,
    };

    return (
        <div className="flex w-full items-start justify-between gap-8">
            {/* Navigator */}
            <NavigatorBox propsNav={propsNavigator} />

            {/* Reading Box */}
            <div className="max-h-[85vh] w-1/3 flex-1 space-y-4 overflow-auto rounded-sm bg-white p-4 shadow-sm">
                <h2 className="text-xl font-semibold">Passage : {currentReading.title}</h2>
                <p className="text-justify break-words text-gray-700 select-none">{(currentReading as any).passage}</p>
            </div>

            {/* Questions Section */}
            <div className="max-h-[100vh] w-1/3">
                <div className="max-h-[80vh] flex-1 space-y-4 overflow-auto rounded-t-lg border border-gray-200 bg-white p-6 shadow-lg">
                    <div key={currentQuestion.id} className="flex flex-col gap-4">
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-4">
                            <p className="text-md flex-1 leading-relaxed text-gray-700">
                                <span className="font-semibold text-blue-600">{currentQuestion.order}.</span> {currentQuestion.question}
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
                                        {/* <span className="min-w-[20px] font-semibold text-blue-600">{String.fromCharCode(65 + index)}.</span> */}
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

export default ReadingQuestion;
