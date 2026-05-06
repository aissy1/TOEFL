import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ListeningSet, Props } from '@/types';
import { useForm } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import NavigatorBox from '../layouts/navigator-question';
import { useSpeech } from '../utils/TextToSpeech';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase =
    | 'idle' // belum mulai, tombol Play passage tampil
    | 'playing-passage' // passage audio sedang diputar
    | 'playing-question' // question audio sedang autoplay
    | 'answering'; // user memilih jawaban

type PassageData = {
    type: 'listening';
    part: 'A' | 'B' | 'C';
    actors: { id: string; name: string; gender: string }[];
    dialog: { actor_id: string; text: string }[];
};

// ─── Config per Part ─────────────────────────────────────────────────────────

const partConfig: Record<string, { maxPlay: number; label: string }> = {
    A: { maxPlay: 2, label: 'Part A — Short Conversation' },
    B: { maxPlay: 1, label: 'Part B — Longer Conversation' },
    C: { maxPlay: 1, label: 'Part C — Talk / Lecture' },
};

// ─── Component ───────────────────────────────────────────────────────────────

const ListeningQuestion = forwardRef(function ListeningQuestion({ onComplete, section, questions, idSubtest }: Props, ref) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        currentIndex: 0,
        currentQuestionIndex: 0,
        score: 0,
        toeflSubtests: idSubtest,
        section: section,
    });

    const [flagged, setFlag] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [message, setMessage] = useState('');
    const { speak, cancel } = useSpeech();

    // ── Audio passage ──
    const passageAudioRef = useRef<HTMLAudioElement>(null);
    const [playCountMap, setPlayCountMap] = useState<Record<number, number>>({});
    const [isPlaying, setIsPlaying] = useState(false);

    // ── Question audio (TTS / pre-recorded) ──
    const questionAudioRef = useRef<HTMLAudioElement>(null);

    // ── Phase ──
    const [phase, setPhase] = useState<Phase>('idle');

    // ── Derived ──────────────────────────────────────────────────────────────

    const flatQuestions = (questions as any[]).flatMap((listening: any) =>
        listening.questions.map((q: any) => ({ ...q, listeningId: listening.id })),
    );

    const currentQuestion = flatQuestions[data.currentQuestionIndex];
    const currentListening = questions.find((r) => r.id === currentQuestion?.listeningId) as ListeningSet;
    const passage = currentListening?.passage ? (JSON.parse(currentListening.passage) as PassageData) : null;
    const part = passage?.part ?? 'A';
    const config = partConfig[part];
    const currentPlayCount = playCountMap[currentListening?.id ?? 0] ?? 0;
    const maxPlay = config.maxPlay;

    const shouldShowQuestion = phase === 'answering' || !!data.answers[currentQuestion.id] || currentPlayCount >= maxPlay;

    // Soal dalam passage yang sama (untuk Part B/C loop)
    const questionsInCurrentPassage = flatQuestions.filter((q) => q.listeningId === currentListening?.id);
    const indexInPassage = questionsInCurrentPassage.findIndex((q) => q.id === currentQuestion?.id);

    const partInstructions: Record<string, string[]> = {
        A: [
            'You will hear short conversations between two people.',
            'After each conversation, you will hear a question. Choose the best answer.',
            'You may play the audio up to 2 times.',
        ],
        B: [
            'You will hear longer conversations between two people.',
            'Answer all questions based on what the speakers say.',
            'You can only play the audio once.',
        ],
        C: [
            'You will hear a talk or lecture by one speaker.',
            'Answer all questions based on what the speaker says.',
            'You can only play the audio once.',
        ],
    };

    const answeredCount = Object.keys(data.answers).length;
    const allQuestionsAnswered = flatQuestions.every((q) => data.answers[q.id]);

    // ── Reset phase & audio saat passage berubah ──────────────────────────────

    useEffect(() => {
        setPhase('idle');
        setIsPlaying(false);
        if (passageAudioRef.current) {
            passageAudioRef.current.pause();
            passageAudioRef.current.currentTime = 0;
        }
        if (questionAudioRef.current) {
            questionAudioRef.current.pause();
            questionAudioRef.current.currentTime = 0;
        }
    }, [currentListening?.id]);

    // ── Play question audio otomatis setelah phase berubah ke playing-question ─

    useEffect(() => {
        console.log(phase);
        if (phase !== 'playing-question') return;

        speak(currentQuestion.question, () => {
            setPhase('answering');
        });

        // if (!questionAudioRef.current || !currentQuestion?.question_audio_url) {
        //     // Tidak ada audio soal → langsung ke answering
        //     setPhase('answering');
        //     return;
        // }

        // questionAudioRef.current.src = currentQuestion.question_audio_url;
        // questionAudioRef.current.currentTime = 0;
        // questionAudioRef.current.play().catch(() => setPhase('answering'));
    }, [phase, currentQuestion?.id]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handlePlayPassage = async () => {
        if (!passageAudioRef.current) return;

        if (isPlaying) {
            passageAudioRef.current.pause();
            setIsPlaying(false);
            setPhase('idle');
        }
        if (currentPlayCount >= maxPlay) {
            setIsPlaying(false);
            setPhase('answering');
        } else {
            passageAudioRef.current.currentTime = 0;
            try {
                await passageAudioRef.current.play();
                setIsPlaying(true);
                setPhase('playing-passage');
            } catch (err) {
                console.error('Audio play failed:', err);
            }
        }
    };

    const handlePassageEnded = () => {
        setIsPlaying(false);
        setPlayCountMap((prev) => ({
            ...prev,
            [currentListening.id]: (prev[currentListening.id] ?? 0) + 1,
        }));
        if (passageAudioRef.current) passageAudioRef.current.currentTime = 0;

        // Setelah passage selesai → langsung autoplay question pertama
        setPhase('playing-question');
    };

    const handleQuestionAudioEnded = () => {
        // Setelah question audio selesai → user bisa menjawab
        setPhase('answering');
    };

    const handleNext = () => {
        const isLastInPassage = indexInPassage === questionsInCurrentPassage.length - 1;
        const isLastQuestion = data.currentQuestionIndex === flatQuestions.length - 1;

        if (isLastQuestion) {
            const unansweredQuestions = flatQuestions.filter((q) => !data.answers[q.id]);
            setMessage(
                unansweredQuestions.length > 0
                    ? `You have ${unansweredQuestions.length} unanswered questions. Do you want to submit and proceed to the next section?`
                    : 'Do you really want to submit and proceed to the next section?',
            );
            setOpenDialog(true);
            return;
        }

        if (!isLastInPassage) {
            // Part B/C: masih dalam passage yang sama → autoplay soal berikutnya
            setData('currentQuestionIndex', data.currentQuestionIndex + 1);
            setPhase('playing-question');
        } else {
            // Pindah ke passage berikutnya → reset ke idle
            setData('currentQuestionIndex', data.currentQuestionIndex + 1);
            setPhase('idle');
        }
    };

    const handlePrev = () => {
        if (data.currentQuestionIndex > 0) {
            setData('currentQuestionIndex', data.currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            post('/submit-test');
            onComplete();
        } catch (error) {
            console.error('Error submitting test:', error);
            setIsSubmitting(false);
        }
    };

    const toggleFlag = (id: number) => setFlag((prev) => ({ ...prev, [id]: !prev[id] }));

    useImperativeHandle(ref, () => ({ handleSubmit }));

    const propsNavigator = {
        props: data,
        setData,
        sectionQuestions: questions,
        onComplete,
        handleSubmit,
        flagged,
    };

    // ── Guard ─────────────────────────────────────────────────────────────────

    if (!currentQuestion || !currentListening) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600">Loading questions...</h2>
                </div>
            </div>
        );
    }

    // ── Render helpers ────────────────────────────────────────────────────────

    const playButtonLabel = () => {
        if (isPlaying) return 'Pause';
        if (currentPlayCount >= maxPlay) return 'No plays left';
        return `Play (${maxPlay - currentPlayCount} left)`;
    };

    const noticeText = () => {
        if (part === 'A') return `You can play this audio up to ${maxPlay} times.`;
        return `You can only play this audio once. Listen carefully!`;
    };

    // Next disabled saat audio masih berjalan atau belum mulai
    const nextDisabled = isSubmitting || phase === 'playing-passage' || phase === 'playing-question' || (phase === 'idle' && currentPlayCount === 0); // belum pernah play sama sekali

    // ── JSX ───────────────────────────────────────────────────────────────────

    return (
        <div className="flex w-full flex-col items-start justify-between gap-4 lg:flex-row lg:gap-8">
            <NavigatorBox propsNav={propsNavigator} />

            {/* ── Passage / Audio Panel ── */}
            <div className="max-h-[85vh] w-full flex-1 space-y-4 overflow-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg lg:w-1/3">
                <div className="flex flex-col gap-2 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">{config.label}</span>
                    </div>
                    <h2 className="text-left text-xl font-semibold text-gray-800">{currentListening.title}</h2>
                    <div className="text-right text-sm text-gray-500">
                        Question {indexInPassage + 1} of {questionsInCurrentPassage.length} in this passage
                    </div>
                </div>

                {/* INFO */}

                <div className="space-y-1 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-blue-700">Instructions:</p>
                    {partInstructions[part].map((line, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <span className="mt-0.5 text-xs text-blue-400">•</span>
                            <p className="text-xs text-blue-700">{line}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 flex-shrink-0 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        <p className="text-sm font-medium text-yellow-800">Important: {noticeText()}</p>
                    </div>
                </div>

                {/* Hidden audio elements */}
                <audio ref={passageAudioRef} src={currentListening?.audio_url} onEnded={handlePassageEnded} />

                {/* Play passage button */}
                <div className="flex flex-col gap-3">
                    <Button
                        type="button"
                        onClick={handlePlayPassage}
                        disabled={currentPlayCount >= maxPlay || phase === 'playing-question' || phase === 'answering'}
                        className="w-full"
                    >
                        {playButtonLabel()}
                    </Button>

                    {currentPlayCount >= maxPlay && (
                        <p className="text-center text-sm text-red-500">You have used all {maxPlay} plays for this audio.</p>
                    )}
                </div>

                {/* Phase indicator */}
                <div className="rounded-lg border bg-gray-50 p-3 text-center text-sm text-gray-600">
                    {phase === 'idle' && currentPlayCount === 0 && '⏸ Press Play to start listening.'}
                    {phase === 'idle' && currentPlayCount > 0 && part === 'A' && '▶ You may play the audio again.'}
                    {phase === 'playing-passage' && '🔊 Listening to passage...'}
                    {phase === 'playing-question' && '🔊 Listen to the question...'}
                    {phase === 'answering' && '✏️ Select your answer below.'}
                </div>
            </div>

            {/* ── Question Panel ── */}
            <div className="max-h-[100vh] w-full lg:w-1/3">
                <div className="max-h-[80vh] flex-1 space-y-4 overflow-auto rounded-t-lg border border-gray-200 bg-white p-6 shadow-lg">
                    <div key={currentQuestion.id} className="flex flex-col gap-4">
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-4">
                            <p className="text-md flex-1 leading-relaxed text-gray-700">
                                <span className="font-semibold text-blue-600">Q{currentQuestion.order}.</span>{' '}
                                {/* Soal hanya tampil saat phase answering */}
                                {/* {phase === 'answering' || data.answers[currentQuestion.id] ? (
                                    currentQuestion.question
                                ) : (
                                    <span className="text-gray-400 italic">Question will appear after the audio plays.</span>
                                )} */}
                                {shouldShowQuestion ? (
                                    currentQuestion.question
                                ) : (
                                    <span className="text-gray-400 italic">Question will appear after the audio plays.</span>
                                )}
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

                        {/* Answer Choices — hanya tampil saat answering */}
                        {shouldShowQuestion && (
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
                        )}

                        {/* Waiting state */}
                        {!shouldShowQuestion && !data.answers[currentQuestion.id] && (
                            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-8 text-sm text-gray-400">
                                Waiting for audio to finish...
                            </div>
                        )}
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
                                disabled={nextDisabled}
                                className={`px-6 ${data.currentQuestionIndex === flatQuestions.length - 1 ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="mr-2 -ml-1 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
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

                        {allQuestionsAnswered && (
                            <div className="mt-3 rounded border border-green-200 bg-green-50 p-2 text-center">
                                <p className="text-sm text-green-700">✓ All questions answered! Ready to submit.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialog Konfirmasi Submit */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
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
                        <Button variant="outline" onClick={() => setOpenDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setOpenDialog(false);
                                handleSubmit();
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
