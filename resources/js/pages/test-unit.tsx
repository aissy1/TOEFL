// resources/js/pages/test-info.tsx
import { Button } from '@/components/ui/button';
import { Head, Link, usePage } from '@inertiajs/react';
import { useSpeech } from './components/utils/TextToSpeech';

type InfoSection = {
    id: string;
    title: string;
    content: string[];
    nextId?: string;
};

function normalizeName(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-');
}

function buildSections(toeflSubtests: any[]): InfoSection[] {
    const sorted = [...toeflSubtests].sort((a, b) => a.order - b.order);

    const sections: InfoSection[] = [
        {
            id: 'general',
            title: 'General Information',
            content: [
                'This test consists of several sections that must be completed in order.',
                'Each section has its own instructions and time limit.',
                'Make sure you read all instructions carefully before continuing.',
            ],
        },
    ];

    sorted.forEach((item, index) => {
        const current = normalizeName(item.subtest.name);

        sections.push({
            id: current, // contoh: reading
            title: `${item.subtest.name} Section Information`,
            content: item.subtest.instructions ?? [],
        });
    });

    return sections;
}

export default function TestInfoPage() {
    const {
        section = 'general',
        toeflSubtests,
        nextSection,
    } = usePage().props as unknown as {
        section?: string;
        nextSection: string;
        toeflSubtests: any[];
    };

    // console.log('Received props:', { section, toeflSubtests, nextSection });

    const sections = buildSections(toeflSubtests);
    const currentIndex = sections.findIndex((s) => s.id === section);
    const current = sections[currentIndex];

    // checking listening section
    const isListeningSection = section.includes('listening');

    const { speak, cancel } = useSpeech();
    const checkAudio = async () => speak('hey is your audio working');

    if (!current) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
                <div className="flex w-full max-w-4xl justify-center rounded-2xl bg-white shadow-md">
                    <div className="rounded-t-2xl p-6 text-white">
                        <h1 className="font-bold text-red-600">Section not found</h1>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title={current.title} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
                {/* Progress */}
                <div className="border-b bg-white px-6 py-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-2 flex justify-between text-sm text-gray-600">
                            <span>Test Instructions Progress</span>
                            <span>
                                {currentIndex + 1} of {sections.length}
                            </span>
                        </div>
                        <div className="h-2 rounded bg-gray-200">
                            <div
                                className="h-2 rounded bg-indigo-600 transition-all"
                                style={{
                                    width: `${((currentIndex + 1) / sections.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6">
                    <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
                        {/* Header */}
                        <div className="rounded-t-2xl bg-indigo-600 p-6 text-white">
                            <h1 className="text-2xl font-bold">{current.title}</h1>
                            <p className="text-sm opacity-90">Please read the following information carefully</p>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-4 p-8">
                            {current.content.map((text, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-lg border bg-gray-50 p-4 text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: text }}
                                />
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col items-center justify-between gap-4 border-t p-6 sm:flex-row sm:items-start">
                            <span className="text-center text-sm text-gray-500 sm:text-left">
                                {isListeningSection
                                    ? 'Make sure you understand and check the audio before continuing'
                                    : 'Make sure you understand before continuing'}
                            </span>

                            <div className="flex items-center gap-3">
                                {isListeningSection && (
                                    <Button onClick={() => checkAudio()} variant={'outline'} className="border border-indigo-600">
                                        Check Audio
                                    </Button>
                                )}

                                {nextSection ? (
                                    <Link href={`/test/${nextSection}`}>
                                        <Button className="rounded-lg bg-indigo-600 px-6 py-2 text-white">Continue →</Button>
                                    </Link>
                                ) : (
                                    <Link href="/test/start">
                                        <Button className="rounded-lg bg-green-600 px-6 py-2 text-white">Start Test →</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
