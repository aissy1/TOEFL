import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ListeningQuestion from './components/questions/listening-questions';
import ReadingQuestion from './components/questions/reading-questions';
import SpeakingQuestion from './components/questions/speaking-questions';
import WritingQuestion from './components/questions/writing-questions';

const questionPage = [
    {
        id: 'reading-question',
        component: ReadingQuestion,
        nextId: 'listening',
        title: 'Reading Section',
        duration: 5 * 60, // 5 minutes
    },
    {
        id: 'listening-question',
        component: ListeningQuestion,
        nextId: 'speaking',
        title: 'Listening Section',
        duration: 5 * 60, // 5 minutes
    },
    {
        id: 'speaking-question',
        component: SpeakingQuestion,
        nextId: 'writing',
        title: 'Speaking Section',
        duration: 5 * 60, // 5 minutes
    },
    {
        id: 'writing-question',
        component: WritingQuestion,
        nextId: 'scoreboard',
        title: 'Writing Section',
        duration: 5 * 60, // 5 minutes
    },
];

export default function TestQuestion() {
    const { section, questions, answeredCounts } = usePage().props as unknown as {
        section?: string;
        questions?: any[];
        answeredCounts: {
            reading: boolean;
            listening: boolean;
            speaking: boolean;
            writing: boolean;
        };
    };

    const [answeredCount, setAnsweredCount] = useState<boolean>(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
    const [isTimerActive, setIsTimerActive] = useState(true);

    const sectionRef = useRef<{ handleSubmit: () => void }>(null);

    const currentPage = questionPage.find((page) => page.id === section);
    const sectionActive = section?.replace('-question', '');

    const Component = currentPage?.component ?? (() => <div>Page not found</div>);

    const handleComplete = () => {
        setIsTimerActive(false);
        if (currentPage?.nextId === 'scoreboard') {
            router.visit('/scoreboard');
        } else if (currentPage?.nextId) {
            router.visit(`/test/${currentPage?.nextId}`);
        }
    };

    const handleDialogSubmit = () => {
        if (sectionRef.current) {
            sectionRef.current.handleSubmit();
        }
    };

    const handleButtonDialog = () => {
        if (timeLeft <= 1) {
            handleDialogSubmit();
        } else {
            handleComplete();
        }
        setOpenDialog(false);
        setMessage('');
    };

    // Initialize timer and check if section is already completed
    useEffect(() => {
        console.log('Initializing section:', section);
        
        // Set initial timer based on current section
        if (currentPage) {
            setTimeLeft(currentPage.duration);
        }

        // Check if section is already completed
        let isCompleted = false;
        switch (section) {
            case 'reading-question':
                isCompleted = answeredCounts.reading;
                break;
            case 'listening-question':
                isCompleted = answeredCounts.listening;
                break;
            case 'speaking-question':
                isCompleted = answeredCounts.speaking;
                break;
            case 'writing-question':
                isCompleted = answeredCounts.writing;
                break;
        }

        setAnsweredCount(isCompleted);

        if (isCompleted) {
            setOpenDialog(true);
            setMessage(`You have already completed the ${currentPage?.title || sectionActive}!`);
            setIsTimerActive(false);
            return;
        }

        setIsTimerActive(true);
    }, [section, answeredCounts, currentPage, sectionActive]);

    // Timer effect
    useEffect(() => {
        if (!isTimerActive) return;

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    setOpenDialog(true);
                    setMessage('Time has expired for this section. Your answers will be automatically submitted.');
                    setIsTimerActive(false);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTimerActive]);

    // Timer warning states
    const isWarning = timeLeft <= 60; // Warning when 1 minute left
    const isCritical = timeLeft <= 30; // Critical when 30 seconds left

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (isCritical) return 'bg-red-600 animate-pulse';
        if (isWarning) return 'bg-yellow-500';
        return 'bg-blue-600';
    };

    const getTimerIcon = () => {
        if (isCritical) {
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            );
        }
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    };

    if (!currentPage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 shadow-lg">
                    <h1 className="text-xl font-bold text-red-600">Section not found</h1>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title={`${currentPage.title} - TOEFL Test`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
                {/* Header with Timer */}
                <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        {/* Section Title */}
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">{currentPage.title}</h1>
                                <p className="text-xs text-gray-500">TOEFL Practice Test</p>
                            </div>
                        </div>

                        {/* Timer */}
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-white font-semibold shadow-lg ${getTimerColor()}`}>
                            {getTimerIcon()}
                            <span className="text-sm">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="pt-20 min-h-screen">
                    <div className="container mx-auto px-4 py-6">
                        <Component 
                            ref={sectionRef} 
                            onComplete={handleComplete} 
                            section={currentPage?.id} 
                            questions={questions} 
                        />
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
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span>Section Status</span>
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 leading-relaxed">
                                {message}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                onClick={handleButtonDialog}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                            >
                                <div className="flex items-center space-x-2">
                                    <span>Continue</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}