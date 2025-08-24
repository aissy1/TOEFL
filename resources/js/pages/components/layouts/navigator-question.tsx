import { usePage } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';

type NavigatorBoxProps = {
    propsNav: {
        props: {
            answers: Record<number, string>;
            currentQuestionIndex: number;
        };
        setData: (field: string, value: any) => void;
        sectionQuestions: any[];
        flagged?: Record<number, boolean>;
    };
};

export default function NavigatorBox({ propsNav }: NavigatorBoxProps) {
    const { props, setData, sectionQuestions, flagged = {} } = propsNav;
    const { section } = usePage().props as { section?: string };

    const { username } = usePage().props as { username?: string };

    const sectionActive = section?.replace('-', ' ');

    // Handle both array and single object structure
    const flatQuestions = Array.isArray(sectionQuestions)
        ? sectionQuestions.flatMap((reading) => {
              // Handle different section structures
              if (section === 'speaking-question' || section === 'writing-question') {
                  // For speaking and writing, each item is a single question
                  return [
                      {
                          id: reading.id,
                          question: (reading as any).question || reading.title,
                          readingId: reading.id,
                      },
                  ];
              } else {
                  // For reading and listening, each item has a questions array
                  return reading.questions.map((question: any) => ({
                      ...question,
                      readingId: reading.id,
                  }));
              }
          })
        : [
              {
                  id: (sectionQuestions as any).id,
                  question: (sectionQuestions as any).question?.[0]?.question || (sectionQuestions as any).title,
                  readingId: (sectionQuestions as any).id,
              },
          ];

    const handleNavigateIndex = (questionIndex: number) => {
        const isSectionPerQuestion = (section: string | undefined) => section === 'speaking-question' || section === 'writing-question';
        const question = flatQuestions[questionIndex];

        if (isSectionPerQuestion(section)) {
            setData('currentQuestionIndex', questionIndex);
        } else {
            // reading/listening - only works when sectionQuestions is an array
            if (Array.isArray(sectionQuestions)) {
                const readingIndex = sectionQuestions.findIndex((r) => r.id === question.readingId);
                setData('currentIndex', readingIndex);
                setData('currentQuestionIndex', questionIndex);
            } else {
                // For single object case, just set the question index
                setData('currentQuestionIndex', questionIndex);
            }
        }
    };

    return (
        <div className="w-60 space-y-4 rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm font-medium">{username}</div>
            <div className="text-xs text-gray-500">{sectionActive} navigator</div>

            <div className="grid grid-cols-5 gap-2 text-sm">
                {flatQuestions.map((q, i) => {
                    const isFlagged = flagged[q.id];
                    const isActive = props.currentQuestionIndex === i;
                    const isAnswered = props.answers.hasOwnProperty(q.id);

                    return (
                        <button
                            key={q.id}
                            className={`h-8 w-8 cursor-pointer rounded-full border text-center ${
                                isAnswered && isFlagged
                                    ? 'bg-yellow-200 text-black'
                                    : isActive
                                      ? 'bg-indigo-600 text-white'
                                      : isAnswered
                                        ? 'bg-green-700 text-white'
                                        : isFlagged
                                          ? 'bg-yellow-200 text-black'
                                          : 'bg-gray-100 hover:bg-indigo-100'
                            }`}
                            onClick={() => handleNavigateIndex(i)}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>
            <div className="mt-2 flex flex-col gap-1">
                <p className="text-md font-semibold text-green-800">Hint</p>
                <div className="flex items-center">
                    <Flag className="h-3 w-3" /> <p className="text-sm">: to inform your answer </p>
                </div>
                <div className="flex items-center">
                    <FlagOff className="h-3 w-3" /> <p className="text-sm">: to stop inform your answer </p>
                </div>
            </div>
        </div>
    );
}
