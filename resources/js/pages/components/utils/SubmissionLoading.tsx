import { Award, Clock, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SubmissionLoadingProps {
    isVisible: boolean;
    message?: string;
}

export default function SubmissionLoading({ isVisible, message = 'Processing your essay...' }: SubmissionLoadingProps) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            setDots((prev) => {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 500);

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="mx-4 max-w-md rounded-xl bg-white p-8 text-center shadow-2xl">
                <div className="mb-6">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <FileText className="h-8 w-8 animate-pulse text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-800">Evaluating Your Essay</h3>
                    <p className="text-gray-600">
                        {message}
                        {dots}
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Analyzing content</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4" />
                            <span>Calculating score</span>
                        </div>
                    </div>

                    <div className="h-2 w-full rounded-full bg-gray-200">
                        <div className="h-2 animate-pulse rounded-full bg-blue-600" style={{ width: '60%' }}></div>
                    </div>
                </div>

                <p className="mt-4 text-xs text-gray-400">This may take a few moments...</p>
            </div>
        </div>
    );
}
