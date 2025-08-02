import { useEffect, useState } from 'react';
import { Award, Clock, FileText } from 'lucide-react';

interface SubmissionLoadingProps {
    isVisible: boolean;
    message?: string;
}

export default function SubmissionLoading({ isVisible, message = "Processing your essay..." }: SubmissionLoadingProps) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            setDots(prev => {
                if (prev === '...') return '';
                return prev + '.';
            });
        }, 500);

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Evaluating Your Essay</h3>
                    <p className="text-gray-600">
                        {message}{dots}
                    </p>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Analyzing content</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4" />
                            <span>Calculating score</span>
                        </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-4">
                    This may take a few moments...
                </p>
            </div>
        </div>
    );
}
