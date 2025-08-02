import { Button } from '@/components/ui/button';
import { Props } from '@/types';
import { useForm } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import NavigatorBox from '../layouts/navigator-question';

const ReadingQuestion = forwardRef(function ReadingQuestion({ onComplete, section, questions }: Props, ref) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        currentQuestionIndex: 0,
        score: 0,
        section: section,
    });

    const [flagged, setFlag] = useState<Record<number, boolean>>({}) || false;

    const flatQuestions = (questions as any[]).flatMap((reading: any) => reading.questions.map((q: any) => ({ ...q, readingId: reading.id })));

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
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        let score = 0;
        const unansweredQuestions = flatQuestions.filter(q => !data.answers[q.id]);
        
        if (unansweredQuestions.length > 0) {
            const confirmed = confirm(`You have ${unansweredQuestions.length} unanswered questions. Do you want to submit anyway?`);
            if (!confirmed) return;
        }

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
    };

    useImperativeHandle(ref, () => ({
        handleSubmit,
    }));

    useEffect(() => {
        if (data.score !== 0) {
            post('/submit-test');
            onComplete(); // Setelah kirim
        }
    }, [data.score]);

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

            {/* Question Box */}
            <div className="max-h-[100vh] w-1/3">
                <div className="max-h-[80vh] flex-1 space-y-4 overflow-auto rounded-t-sm bg-white p-4 shadow-sm">
                    <div key={currentQuestion.id} className="flex flex-col gap-2">
                        <div className="flex justify-between gap-2">
                            <p className="leading-relaxed text-gray-700">{currentQuestion.question}</p>
                            <Button variant={'outline'} onClick={() => toggleFlag(currentQuestion.id)}>
                                {flagged[currentQuestion.id] ? (
                                    <FlagOff className="h-5 w-5 text-red-600" />
                                ) : (
                                    <Flag className="h-5 w-5 text-red-600" />
                                )}
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {currentQuestion.choices?.map((choice: string, index: number) => (
                                <label
                                    key={index}
                                    className={`block cursor-pointer rounded-md border px-4 py-2 ${
                                        data.answers[currentQuestion.id] === choice
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-blue-400'
                                    }`}
                                >
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
                                        className="mr-2"
                                    />
                                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {choice}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="rounded-b-sm bg-white shadow-sm">
                    <div className="mx-2 mb-2 flex justify-between py-2">
                        <Button size="sm" onClick={handlePrev} disabled={data.currentQuestionIndex === 0}>
                            Prev
                        </Button>
                        <Button size="sm" onClick={handleNext}>
                            {data.currentQuestionIndex === flatQuestions.length - 1 ? 'Next Section' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ReadingQuestion;
