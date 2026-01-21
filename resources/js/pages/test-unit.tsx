// resources/js/pages/test-info.tsx
import { Button } from '@/components/ui/button';
import { Head, Link, usePage } from '@inertiajs/react';

const sections = [
    {
        id: 'general',
        title: 'General Information',
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        content: [
            'In the <strong>Reading</strong> section, you will answer questions about reading passages. In this practice test, you will be able to review the correct answer for each question by reviewing the answer key at the end of the section.',
            'In the <strong>Listening</strong> section, you will answer questions about conversations and lectures. In this practice test, you will be able to review the correct answer for each question by reviewing the answer key at the end of the section.',
            'In the <strong>Speaking</strong> section, you will be presented with four questions. The first question is about a familiar topic. The other questions ask you to speak about reading passages, conversations, and lectures. In this practice test, your responses will not be scored. Instead, you will see sample responses to each question.',
            'In the <strong>Writing</strong> section, you will be presented with two writing tasks. The first task asks you to write about a reading passage and a lecture. The second task asks you to write a post for an academic discussion. In this practice test, your responses will not be scored. Instead, you will see sample responses to each question.',
        ],
        nextId: 'reading',
    },
    {
        id: 'reading',
        title: 'Reading Section Information',
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
            </svg>
        ),
        content: [
            'This section tests your ability to understand academic reading material.',
            'You will read 3-4 passages, each followed by 12-14 questions.',
            'Each passage is approximately 700 words long and covers academic topics.',
            'You will have 54-72 minutes to complete this section.',
            'Questions include multiple choice, drag-and-drop, and text insertion tasks.',
        ],
        nextId: 'reading-question',
    },
    {
        id: 'listening',
        title: 'Listening Section Information',
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
            </svg>
        ),
        content: [
            'This section tests your ability to understand spoken English in academic settings.',
            'You will listen to lectures, classroom discussions, and conversations.',
            'The section includes 3-4 lectures and 2-3 conversations.',
            'You will have 41-57 minutes to complete this section.',
            'Take notes while listening as you cannot replay the audio.',
        ],
        nextId: 'listening-question',
    },
    {
        id: 'speaking',
        title: 'Speaking Section Information',
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
            </svg>
        ),
        content: [
            'This section tests your ability to speak English in academic settings.',
            'You will complete 4 speaking tasks in approximately 17 minutes.',
            'Task 1: Independent speaking about a familiar topic (15 seconds prep, 45 seconds response).',
            'Tasks 2-4: Integrated speaking combining reading, listening, and speaking skills.',
            'Speak clearly into the microphone and organize your thoughts during preparation time.',
        ],
        nextId: 'speaking-question',
    },
    {
        id: 'structure',
        title: 'Structure and Written Expression Information',
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m-6-8h6M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                />
            </svg>
        ),
        content: [
            'This section measures your ability to recognize correct grammatical structures in written English.',
            'You will answer 40 questions in 25 minutes.',
            'Part A: Structure (15 questions) – Choose the word or phrase that best completes the sentence.',
            'Part B: Written Expression (25 questions) – Identify the underlined word or phrase that must be changed.',
            'Focus on grammar, sentence structure, verb tense, agreement, and word choice.',
            'You are not allowed to use a dictionary during this section.',
        ],
        nextId: 'structure-question',
    },
    {
        id: 'writing',
        title: 'Writing Section Information',
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
            </svg>
        ),
        content: [
            'This section tests your ability to write in English in academic settings.',
            'You will complete 2 writing tasks in 50 minutes total.',
            'Task 1: Integrated writing - read a passage, listen to a lecture, then write a response (20 minutes).',
            'Task 2: Academic discussion - contribute to an online discussion (10 minutes).',
            'Use proper academic writing structure and support your ideas with examples.',
        ],
        nextId: 'writing-question',
    },
];

// Section progress indicators
const sectionOrder = ['general', 'reading', 'structure', 'listening', 'writing'];

export default function TestInfoPage() {
    const { section } = usePage().props as { section?: string };

    const sectionId = section ?? 'general';
    const current = sections.find((s) => s.id === sectionId);
    const currentIndex = sectionOrder.indexOf(sectionId);

    if (!current) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="rounded-xl bg-white p-8 shadow-lg">
                    <h1 className="text-xl font-bold text-red-600">Section not found</h1>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title={current.title} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                {/* Progress Bar */}
                <div className="relative z-10 border-b border-gray-200/50 bg-white/80 px-6 py-4 backdrop-blur-sm">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-600">Test Instructions Progress</h2>
                            <span className="text-sm text-gray-500">
                                {currentIndex + 1} of {sectionOrder.length}
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / sectionOrder.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center p-6">
                    <div className="w-full max-w-4xl">
                        {/* Main Card */}
                        <div className="relative">
                            {/* Decorative background blur */}
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-25 blur"></div>

                            {/* Content Card */}
                            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">{current.icon}</div>
                                        <div>
                                            <h1 className="text-2xl font-bold">{current.title}</h1>
                                            <p className="mt-1 text-sm text-blue-100">Please read the following information carefully</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <div className="space-y-4">
                                        {current.content.map((text, idx) => (
                                            <div key={idx} className="flex items-start space-x-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                                                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                </div>
                                                <div className="leading-relaxed text-gray-700" dangerouslySetInnerHTML={{ __html: text }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer with Action Button */}
                                <div className="border-t border-gray-200/50 bg-gray-50/50 p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <span>Make sure you understand these instructions before proceeding</span>
                                            </div>
                                        </div>
                                        <Link href={`/test/${current.nextId}`}>
                                            <Button className="transform rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2.5 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl">
                                                <div className="flex items-center space-x-2">
                                                    <span>Continue</span>
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                        />
                                                    </svg>
                                                </div>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
