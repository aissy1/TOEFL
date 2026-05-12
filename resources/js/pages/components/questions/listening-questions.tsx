import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ListeningSet, Props } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { toast } from 'sonner';
import NavigatorBox from '../utils/navigator-question';
import { useSpeech } from '../utils/TextToSpeech';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase =
    | 'idle' // belum mulai, tombol Play passage tampil
    | 'playing-passage' // passage audio sedang diputar
    | 'playing-question' // TTS soal sedang berjalan (hanya 1x per soal)
    | 'answering'; // user memilih jawaban

type PassageData = {
    type: 'listening';
    part: 'A' | 'B' | 'C';
    actors: { id: string; name: string; gender: string }[];
    dialog: { actor_id: string; text: string }[];
};

// ─── Config per Part ─────────────────────────────────────────────────────────

const partConfig: Record<string, { maxPlay: number; label: string }> = {
    A: { maxPlay: 1, label: 'Part A — Short Conversation' },
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

    const { flash } = usePage().props as any;
    const [flagged, setFlag] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [message, setMessage] = useState('');
    const { speak, cancel } = useSpeech();

    // ── Audio passage ──
    const passageAudioRef = useRef<HTMLAudioElement>(null);
    const [playCountMap, setPlayCountMap] = useState<Record<number, number>>({});
    const [isPlaying, setIsPlaying] = useState(false);

    // ── Phase ──
    const [phase, setPhase] = useState<Phase>('idle');

    // ── Track soal yang sudah diputar TTS (question_id → true) ──
    // Mencegah TTS diputar ulang saat user navigasi prev/next
    const [spokenQuestionsMap, setSpokenQuestionsMap] = useState<Record<number, boolean>>({});

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

    const questionsInCurrentPassage = flatQuestions.filter((q) => q.listeningId === currentListening?.id);
    const indexInPassage = questionsInCurrentPassage.findIndex((q) => q.id === currentQuestion?.id);
    const isLastInPassage = indexInPassage === questionsInCurrentPassage.length - 1;
    const isLastQuestion = data.currentQuestionIndex === flatQuestions.length - 1;

    const unansweredQuestions = flatQuestions.filter((q) => !data.answers[q.id]);
    const answeredCount = Object.keys(data.answers).length;
    const allQuestionsAnswered = flatQuestions.every((q) => data.answers[q.id]);

    // Soal sudah pernah diputar TTS sebelumnya
    const alreadySpoken = !!spokenQuestionsMap[currentQuestion?.id];

    // Tampilkan soal jika: sudah answering, sudah dijawab, sudah diputar TTS, atau jatah passage habis
    const shouldShowQuestion = phase === 'answering' || !!data.answers[currentQuestion?.id] || alreadySpoken || currentPlayCount >= maxPlay;

    // Next disabled saat audio/TTS masih berjalan atau belum pernah play passage
    const nextDisabled = isSubmitting || phase === 'playing-passage' || phase === 'playing-question' || (phase === 'idle' && currentPlayCount === 0);

    const partInstructions: Record<string, string[]> = {
        A: ['You will hear short conversations between two people.'],
        B: ['You will hear longer conversations between two people.'],
        C: ['You will hear a talk or lecture by one speaker.'],
    };

    const generalInstructions = [
        'You can only play the audio once. Listen carefully!',
        'After the audio, the question will be read aloud once.',
        'Select your answer after the question is read.',
    ];

    const instructions = [...partInstructions[part], ...generalInstructions];

    // ─── Reset saat passage berubah ──────────────────────────────────────────

    useEffect(() => {
        cancel();
        setPhase('idle');
        setIsPlaying(false);
        if (passageAudioRef.current) {
            passageAudioRef.current.pause();
            passageAudioRef.current.currentTime = 0;
        }
    }, [currentListening?.id]);

    // ─── TTS: hanya putar jika phase playing-question DAN belum pernah diputar ─

    useEffect(() => {
        if (phase !== 'playing-question') return;

        // Sudah pernah diputar → langsung ke answering tanpa TTS
        if (alreadySpoken) {
            setPhase('answering');
            return;
        }

        if (!currentQuestion?.question) {
            setPhase('answering');
            return;
        }

        // Tandai soal ini sudah diputar SEBELUM speak agar tidak bisa di-trigger ulang
        setSpokenQuestionsMap((prev) => ({ ...prev, [currentQuestion.id]: true }));

        const questionText = `Question number ${currentQuestion.order}. ${currentQuestion.question}`;
        speak(questionText, () => {
            setPhase('answering');
        });

        return () => cancel();
    }, [phase, currentQuestion?.id]);

    // ─── Flash toast ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handlePlayPassage = async () => {
        if (!passageAudioRef.current || currentPlayCount >= maxPlay) return;

        if (isPlaying) {
            passageAudioRef.current.pause();
            setIsPlaying(false);
            setPhase('idle');
            return;
        }

        passageAudioRef.current.currentTime = 0;
        try {
            await passageAudioRef.current.play();
            setIsPlaying(true);
            setPhase('playing-passage');
        } catch (err) {
            console.error('Audio play failed:', err);
        }
    };

    const handlePassageEnded = () => {
        setIsPlaying(false);
        setPlayCountMap((prev) => ({
            ...prev,
            [currentListening.id]: (prev[currentListening.id] ?? 0) + 1,
        }));
        if (passageAudioRef.current) passageAudioRef.current.currentTime = 0;

        // Passage selesai → TTS soal pertama
        setPhase('playing-question');
    };

    // Navigation via navigator box
    const handleNavigate = (targetIndex: number) => {
        if (targetIndex === data.currentQuestionIndex) return;

        cancel(); // stop TTS jika sedang berjalan

        const targetQuestion = flatQuestions[targetIndex];
        const targetListeningId = targetQuestion?.listeningId;
        const targetAlreadySpoken = !!spokenQuestionsMap[targetQuestion?.id];
        const targetPlayCount = playCountMap[targetListeningId ?? 0] ?? 0;
        const targetMaxPlay = partConfig[passage?.part ?? 'A'].maxPlay;

        setData('currentQuestionIndex', targetIndex);

        if (targetListeningId !== currentListening?.id) {
            // Pindah ke passage berbeda
            if (targetPlayCount >= targetMaxPlay) {
                // Passage sudah pernah diputar → langsung answering
                setPhase('answering');
            } else {
                // Passage belum diputar → idle, tunggu user play
                setPhase('idle');
            }
        } else {
            // Dalam passage yang sama
            if (targetAlreadySpoken || !!data.answers[targetQuestion?.id]) {
                setPhase('answering');
            } else if (targetPlayCount >= targetMaxPlay) {
                // Passage sudah selesai tapi soal belum diputar → TTS
                setPhase('playing-question');
            } else {
                // Passage belum diputar
                setPhase('idle');
            }
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setMessage(
                unansweredQuestions.length > 0
                    ? `You have ${unansweredQuestions.length} unanswered questions. Do you want to submit and proceed to the next section?`
                    : 'Do you really want to submit and proceed to the next section?',
            );
            setOpenDialog(true);
            return;
        }

        const nextIndex = data.currentQuestionIndex + 1;
        setData('currentQuestionIndex', nextIndex);

        if (!isLastInPassage) {
            // Part B/C: soal berikutnya dalam passage yang sama
            const nextQuestion = flatQuestions[nextIndex];
            const nextAlreadySpoken = !!spokenQuestionsMap[nextQuestion?.id];

            // Jika soal berikutnya belum pernah diputar → TTS
            // Jika sudah pernah diputar (navigasi balik) → langsung answering
            setPhase(nextAlreadySpoken ? 'answering' : 'playing-question');
        } else {
            // Pindah ke passage berikutnya → reset idle, tunggu user play passage
            setPhase('idle');
        }
    };

    const handlePrev = () => {
        if (data.currentQuestionIndex <= 0) return;

        // Cancel TTS jika sedang berjalan
        cancel();

        const prevIndex = data.currentQuestionIndex - 1;
        setData('currentQuestionIndex', prevIndex);

        // Selalu ke answering saat prev — soal sudah pernah diputar sebelumnya
        // Kecuali berpindah ke passage berbeda → idle
        const prevQuestion = flatQuestions[prevIndex];
        const prevListeningId = prevQuestion?.listeningId;

        if (prevListeningId !== currentListening?.id) {
            // Beda passage → idle, tapi passage sudah diputar jadi tetap tampilkan soal
            setPhase('answering');
        } else {
            setPhase('answering');
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            post('/submit-test', {
                onFinish: () => {
                    setIsSubmitting(false);
                    onComplete();
                },
            });
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
        onNavigate: handleNavigate,
    };

    // ─── Guard ────────────────────────────────────────────────────────────────

    if (!currentQuestion || !currentListening) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600">Loading questions...</h2>
                </div>
            </div>
        );
    }

    // ─── Render helpers ───────────────────────────────────────────────────────

    const playButtonLabel = () => {
        if (isPlaying) return 'Pause';
        if (currentPlayCount >= maxPlay) return 'No plays left';
        return `Play (${maxPlay - currentPlayCount} left)`;
    };

    const phaseIndicator = () => {
        if (phase === 'idle' && currentPlayCount === 0) return '⏸ Press Play to start listening.';
        if (phase === 'playing-passage') return '🔊 Listening to passage...';
        if (phase === 'playing-question') return '🔊 Listen to the question...';
        if (phase === 'answering') return '✏️ Select your answer below.';
        return '';
    };

    // ─── JSX ─────────────────────────────────────────────────────────────────

    return (
        <div className="flex w-full flex-col items-start justify-between gap-4 lg:flex-row lg:gap-8">
            <NavigatorBox propsNav={propsNavigator} />

            {/* ── Passage / Audio Panel ── */}
            <div className="max-h-[85vh] w-full flex-1 space-y-4 overflow-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg lg:w-1/3">
                <div className="flex flex-col gap-2 border-b border-gray-200 pb-3">
                    <span className="w-fit rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">{config.label}</span>
                    <h2 className="text-left text-xl font-semibold text-gray-800">{currentListening.title}</h2>
                    <div className="text-right text-sm text-gray-500">
                        Question {indexInPassage + 1} of {questionsInCurrentPassage.length} in this passage
                    </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-blue-700">Instructions:</p>
                    {instructions.map((line, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <span className="mt-0.5 text-xs text-blue-400">•</span>
                            <p className="text-xs text-blue-700">{line}</p>
                        </div>
                    ))}
                </div>

                {/* Notice */}
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
                        <p className="text-sm font-medium text-yellow-800">Important: You can only play this audio once. Listen carefully!</p>
                    </div>
                </div>

                {/* Hidden passage audio */}
                <audio ref={passageAudioRef} src={currentListening?.audio_url} onEnded={handlePassageEnded} />

                {/* Play passage button */}
                <div className="flex flex-col gap-3">
                    <Button
                        type="button"
                        onClick={handlePlayPassage}
                        disabled={currentPlayCount >= maxPlay || phase === 'playing-question' || phase === 'answering'}
                        className="w-full"
                    >
                        <span className="flex items-center gap-2">
                            {isPlaying ? (
                                <svg className="h-4 w-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="4" width="4" height="16" />
                                    <rect x="14" y="4" width="4" height="16" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                            {playButtonLabel()}
                        </span>
                    </Button>

                    {currentPlayCount >= maxPlay && (
                        <p className="text-center text-sm text-red-500">
                            You have used all {maxPlay} {maxPlay === 1 ? 'play' : 'plays'} for this audio.
                        </p>
                    )}
                </div>

                {/* Phase indicator */}
                <div className="rounded-lg border bg-gray-50 p-3 text-center text-sm text-gray-600">{phaseIndicator()}</div>
            </div>

            {/* ── Question Panel ── */}
            <div className="max-h-[100vh] w-full lg:w-1/3">
                <div className="max-h-[80vh] flex-1 space-y-4 overflow-auto rounded-t-lg border border-gray-200 bg-white p-6 shadow-lg">
                    <div key={currentQuestion.id} className="flex flex-col gap-4">
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-4">
                            <p className="text-md flex-1 leading-relaxed text-gray-700">
                                <span className="font-semibold text-blue-600">Q{currentQuestion.order}.</span>{' '}
                                {phase === 'playing-question' ? (
                                    <span className="text-gray-400 italic">Listen to the question...</span>
                                ) : phase === 'playing-passage' ? (
                                    <span className="text-gray-400 italic">Listen to the passage...</span>
                                ) : !alreadySpoken && phase === 'idle' ? (
                                    <span className="text-gray-400 italic">The audio questions will be played after the reading and only once.</span>
                                ) : (
                                    <span className="text-gray-400 italic">the question audio has been played</span>
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

                        {/* TTS speaking indicator */}
                        {phase === 'playing-question' && (
                            <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                                <svg className="h-4 w-4 animate-pulse text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                                </svg>
                                <span className="text-xs text-blue-600">Reading question aloud...</span>
                            </div>
                        )}

                        {/* Answer Choices */}
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
                        {!shouldShowQuestion && (
                            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-8 text-sm text-gray-400">
                                {phase === 'playing-passage' ? '🔊 Listening to passage...' : 'Waiting for audio to finish...'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-lg">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handlePrev}
                                disabled={data.currentQuestionIndex === 0 || phase === 'playing-passage' || phase === 'playing-question'}
                                className="px-6"
                            >
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
                                className={`px-6 ${isLastQuestion ? 'bg-green-600 hover:bg-green-700' : ''}`}
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
                                        {isLastQuestion ? 'Finish Section' : 'Next'}
                                        {!isLastQuestion && (
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
