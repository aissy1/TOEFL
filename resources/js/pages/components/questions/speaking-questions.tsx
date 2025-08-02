import { Button } from '@/components/ui/button';
import { Props } from '@/types';
import { useForm } from '@inertiajs/react';
import { Flag, FlagOff, Mic, MicOff, Play, Square, CheckCircle } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import NavigatorBox from '../layouts/navigator-question';
import TextToSpeech from '../utils/TextToSpeech';

// Enhanced Speaking Recorder Component with auto-submit
const SpeakingRecorder = ({ 
    onSave, 
    questionId, 
    onAutoSubmit 
}: { 
    onSave: (blob: Blob, questionId: number) => void; 
    questionId: number;
    onAutoSubmit?: () => void;
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Convert WebM to MP3 using Web Audio API
    const convertToMp3 = async (webmBlob: Blob): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    
                    // Create offline context for rendering
                    const offlineContext = new OfflineAudioContext(
                        audioBuffer.numberOfChannels,
                        audioBuffer.length,
                        audioBuffer.sampleRate
                    );
                    
                    const source = offlineContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(offlineContext.destination);
                    source.start();
                    
                    const renderedBuffer = await offlineContext.startRendering();
                    
                    // Convert to WAV
                    const wavBlob = audioBufferToWav(renderedBuffer);
                    resolve(wavBlob);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(webmBlob);
        });
    };

    // Convert AudioBuffer to WAV
    const audioBufferToWav = (buffer: AudioBuffer): Blob => {
        const length = buffer.length;
        const numberOfChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);
        
        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            const chunks: Blob[] = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = async () => {
                const webmBlob = new Blob(chunks, { type: 'audio/webm' });
                setIsProcessing(true);
                
                try {
                    // Convert to MP3/WAV
                    const convertedBlob = await convertToMp3(webmBlob);
                    setAudioBlob(convertedBlob);
                    setAudioUrl(URL.createObjectURL(convertedBlob));
                    
                    // Auto-submit setelah recording selesai
                    await handleAutoSubmit(convertedBlob);
                } catch (error) {
                    console.error('Error converting audio:', error);
                    // Fallback to original blob
                    setAudioBlob(webmBlob);
                    setAudioUrl(URL.createObjectURL(webmBlob));
                    await handleAutoSubmit(webmBlob);
                }
                
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check your permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const handleAutoSubmit = async (blob: Blob) => {
        try {
            // Call the onSave callback
            await onSave(blob, questionId);
            setIsSubmitted(true);
            setIsProcessing(false);
            
            // Call auto submit callback untuk langsung ke pertanyaan berikutnya atau selesai
            setTimeout(() => {
                if (onAutoSubmit) {
                    onAutoSubmit();
                }
            }, 2000); // Delay 2 detik untuk menampilkan hasil
            
        } catch (error) {
            console.error('Error auto-submitting:', error);
            setIsProcessing(false);
        }
    };

    const playRecording = () => {
        if (audioRef.current && audioUrl) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    if (isSubmitted) {
        return (
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="text-center space-y-3">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                    <h3 className="text-lg font-semibold text-green-800">Answer Submitted Successfully!</h3>
                    <p className="text-green-600">Your speaking answer has been recorded and assessed.</p>
                    <div className="text-sm text-green-500">Moving to next question...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="space-y-4">
                {/* Recording Controls */}
                <div className="flex items-center justify-center space-x-4">
                    {!isRecording ? (
                        <Button
                            onClick={startRecording}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full"
                            disabled={isProcessing || audioBlob !== null}
                        >
                            <Mic className="w-5 h-5 mr-2" />
                            {audioBlob ? 'Recording Complete' : 'Start Recording'}
                        </Button>
                    ) : (
                        <Button
                            onClick={stopRecording}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full animate-pulse"
                        >
                            <Square className="w-5 h-5 mr-2" />
                            Stop Recording
                        </Button>
                    )}
                </div>

                {/* Recording Instructions */}
                {!isRecording && !audioBlob && !isProcessing && (
                    <div className="text-center text-sm text-gray-600">
                        <p>Click "Start Recording" to begin. Your answer will be automatically submitted when you stop recording.</p>
                    </div>
                )}

                {/* Recording Timer */}
                {isRecording && (
                    <div className="text-center">
                        <div className="text-2xl font-mono text-red-600 font-bold">
                            {formatTime(recordingTime)}
                        </div>
                        <div className="text-sm text-gray-500">Recording in progress...</div>
                        <div className="text-xs text-gray-400 mt-1">Will auto-submit when you stop</div>
                    </div>
                )}

                {/* Processing State */}
                {isProcessing && (
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600">Processing and submitting audio...</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Please wait while we assess your answer</div>
                    </div>
                )}

                {/* Audio Playback (sebelum submit) */}
                {audioUrl && !isProcessing && !isSubmitted && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center">
                            <Button
                                onClick={playRecording}
                                variant="outline"
                                className="px-4 py-2"
                            >
                                {isPlaying ? (
                                    <MicOff className="w-4 h-4 mr-2" />
                                ) : (
                                    <Play className="w-4 h-4 mr-2" />
                                )}
                                {isPlaying ? 'Pause' : 'Preview Recording'}
                            </Button>
                        </div>
                        
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onEnded={() => setIsPlaying(false)}
                            className="hidden"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const SpeakingQuestion = forwardRef(function SpeakingQuestion({ onComplete, section, questions }: Props, ref) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        recordings: {} as Record<number, Blob>,
        scoreRecords: {} as Record<number, number>,
        currentQuestionIndex: 0,
        score: 0,
        section: section,
    });

    const [flagged, setFlag] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processingQuestions, setProcessingQuestions] = useState<Set<number>>(new Set());

    // Handle both array and single object structure for speaking section
    const flatQuestions = Array.isArray(questions) 
        ? questions.map((speaking: any) => ({ 
            id: speaking.id,
            question: speaking.question || speaking.title,
            speakingId: speaking.id,
            type: speaking.type || 'independent',
            preparationTime: speaking.preparationTime || 15,
            responseTime: speaking.responseTime || 45,
            tips: speaking.tips || []
        }))
        : [{ 
            id: (questions as any).id,
            question: (questions as any).question || (questions as any).title,
            speakingId: (questions as any).id,
            type: (questions as any).type || 'independent',
            preparationTime: (questions as any).preparationTime || 15,
            responseTime: (questions as any).responseTime || 45,
            tips: (questions as any).tips || []
        }];

    const currentQuestion = flatQuestions[data.currentQuestionIndex];
    const currentSpeaking = Array.isArray(questions) 
        ? questions.find((r: any) => r.id === currentQuestion?.speakingId)
        : questions as any;

    const toggleFlag = (id: number) => {
        setFlag((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAutoNext = () => {
        if (data.currentQuestionIndex < flatQuestions.length - 1) {
            setData('currentQuestionIndex', data.currentQuestionIndex + 1);
        } else {
            // Jika ini pertanyaan terakhir, langsung submit test
            handleSubmit();
        }
    };

    const handleSaveRecording = async (blob: Blob, questionId: number) => {
        setProcessingQuestions(prev => new Set([...prev, questionId]));
        
        try {
            // Save recording to state
            setData('recordings', { ...data.recordings, [questionId]: blob });

            // Send to Flask API
            const formData = new FormData();
            formData.append('audio', blob, 'recording.wav');
            formData.append('question', currentQuestion.question);

            const response = await fetch('http://127.0.0.1:5000/assess-speaking', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                const score = Number(result.assessment.score);
                console.log('Transcript:', result.transcription);
                console.log('Score:', result.assessment.score);
                
                setData('answers', {
                    ...data.answers,
                    [questionId]: result.transcription,
                });
                setData('scoreRecords', { 
                    ...data.scoreRecords, 
                    [questionId]: score 
                });
                
                // Show success message briefly
                console.log(`Recording submitted successfully! Score: ${score}`);
            } else {
                console.error('Failed transcription:', result);
                alert('Failed to transcribe audio. Please try again.');
            }
        } catch (error) {
            console.error('Error sending audio:', error);
            alert('Failed to connect to the assessment server.');
        } finally {
            setProcessingQuestions(prev => {
                const newSet = new Set(prev);
                newSet.delete(questionId);
                return newSet;
            });
        }
    };

    const calculateScore = () => {
        return Object.values(data.scoreRecords).reduce((sum, val) => sum + val, 0);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            const totalScore = calculateScore();
            
            // Update score in form data
            setData('score', totalScore);
            
            // Submit to backend
            post('/submit-test');
            
            onComplete();
        } catch (error) {
            console.error('Error submitting test:', error);
            setIsSubmitting(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleSubmit,
    }));

    const propsNavigator = {
        props: data,
        setData: setData,
        sectionQuestions: questions,
        onComplete: onComplete,
        handleSubmit: handleSubmit,
        flagged: flagged,
    };

    // Get progress info
    const answeredCount = Object.keys(data.answers).length;
    const progressPercentage = (answeredCount / flatQuestions.length) * 100;

    if (!currentQuestion || !currentSpeaking) {
        return (
            <div className="flex w-full items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600">Loading questions...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full items-start justify-between gap-8">
            {/* Sidebar Navigator */}
            <NavigatorBox propsNav={propsNavigator} />

            {/* Reading Passage */}
            <div className="max-h-[85vh] w-1/3 flex-1 space-y-4 overflow-auto rounded-lg bg-white p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{currentSpeaking.title}</h2>
                    <div className="text-sm text-gray-500">
                        Question {data.currentQuestionIndex + 1} of {flatQuestions.length}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                        <Mic className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-blue-800 font-medium">
                            Read the passage below, then record your speaking answer. Your answer will be automatically submitted when you stop recording.
                        </p>
                    </div>
                </div>

                <div className="prose prose-sm max-w-none">
                    {/* Display reading passage if it's an integrated speaking task */}
                    {(currentSpeaking as any).reading && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Reading Passage:</h4>
                            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                {(currentSpeaking as any).reading}
                            </p>
                        </div>
                    )}
                    
                    {/* Display listening summary if it's an integrated speaking task */}
                    {(currentSpeaking as any).listening && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Listening Summary:</h4>
                            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                {(currentSpeaking as any).listening}
                            </p>
                        </div>
                    )}
                    
                    {/* Display tips for all speaking tasks */}
                    {(currentSpeaking as any).tips && (currentSpeaking as any).tips.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Tips:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                {(currentSpeaking as any).tips.map((tip: string, index: number) => (
                                    <li key={index}>• {tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Question & Recording Box */}
            <div className="max-h-[100vh] w-1/3">
                <div className="max-h-[80vh] flex-1 space-y-4 overflow-auto rounded-t-lg bg-white p-6 shadow-lg border border-gray-200">
                    <div key={currentQuestion.id} className="flex flex-col gap-4">
                        {/* Question Header */}
                        <div className="flex justify-between items-start gap-4">
                            <p className="text-sm leading-relaxed text-gray-700 flex-1">
                                <span className="font-semibold text-green-600">Q{currentQuestion.id}.</span> {currentQuestion.question}
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

                        {/* Recording Component */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700 block">
                                Record Your Speaking Answer:
                            </label>
                            
                            <SpeakingRecorder 
                                onSave={handleSaveRecording} 
                                questionId={currentQuestion.id}
                                onAutoSubmit={handleAutoNext}
                            />
                            
                            {/* Answer Status */}
                            {data.answers[currentQuestion.id] && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-green-700 font-medium">Answer recorded and submitted</span>
                                    </div>
                                    {data.scoreRecords[currentQuestion.id] && (
                                        <div className="text-xs text-green-600 mt-1">
                                            Score: {data.scoreRecords[currentQuestion.id]}/30
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {processingQuestions.has(currentQuestion.id) && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span className="text-sm text-blue-700">Processing your answer...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Footer - tidak ada tombol navigasi manual */}
                <div className="rounded-b-lg bg-white shadow-lg border border-t-0 border-gray-200">
                    <div className="p-4">
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">
                                Question {data.currentQuestionIndex + 1} of {flatQuestions.length}
                            </div>
                            <div className="text-xs text-gray-500">
                                {answeredCount} of {flatQuestions.length} answered
                            </div>
                            
                            {/* Auto-submit indicator */}
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-center">
                                <p className="text-xs text-blue-700">
                                    🎤 Recording will auto-submit when stopped
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SpeakingQuestion;