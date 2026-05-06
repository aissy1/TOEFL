import { redirectDialog } from '@/pages/components/utils/popup-modal';
import { type QuestionFormData } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
// import { renderSentence } from '../../../utils/constructQuestions';

function escapeRegex(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderSentence(sentence: string, choices: string[]) {
    let result = sentence;

    choices.forEach((choice) => {
        const safe = escapeRegex(choice);
        const regex = new RegExp(`\\b${safe}\\b`, 'gi');

        result = result.replace(regex, `<span class="underline font-bold">${choice}</span>`);
    });

    return result;
}

export default function QuestionsForm({ initialData, submitUrl, method = 'post' }: any) {
    const [disabled, setDisabled] = useState(false);
    const [textPassage, setTextPassage] = useState('');
    const { passages } = usePage().props as unknown as {
        passages: {
            id: number;
            title: string;
            text: any;
        }[];
    };

    const { context } = usePage().props as unknown as {
        context: {
            toefl: number;
            subtest: number;
            toeflSubtest: number;
        };
    };
    const { lastQuestion } = usePage().props as unknown as {
        lastQuestion: number;
    };

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<QuestionFormData>({
        toefl_subtest_id: initialData?.toefl_subtest_id ?? context.toeflSubtest,
        subtest_id: initialData?.subtest_id ?? context.subtest,
        passage_id: initialData?.passage_id ?? null,
        order: initialData?.order ?? lastQuestion,
        question_type: initialData?.question_type ?? '',
        question: initialData?.question ?? '',
        min_words: initialData?.min_words ?? 0,
        choices: initialData?.choices ?? { A: '', B: '', C: '', D: '' },
        correct_answer: initialData?.correct_answer ?? '',
        keywords: initialData?.keywords ?? '',
        point: initialData?.point ?? 1,
    });

    const passage = passages.find((s) => s.id === data.passage_id);

    const cleanText = (text: string) => text.replace(/\\(.)/g, '$1');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);

        const action = method === 'post' ? post : put;

        action(submitUrl, {
            onSuccess: async () => {
                const confirmed = await redirectDialog({
                    title: 'Success',
                    text: method === 'post' ? 'Data berhasil dibuat. Tambah data lagi?' : 'Data berhasil diperbarui. Tetap di halaman?',
                    confirmText: 'Stay here',
                    cancelText: 'Back to Index',
                    icon: 'success',
                });

                if (!confirmed) {
                    router.visit(`/admin/questions/${context.toefl}/subtest/${context.toeflSubtest}/${context.subtest}`, { replace: true });
                } else {
                    reset();
                    clearErrors();
                }
            },
        });
    };

    const handleBack = () => {
        router.visit(`/admin/questions/${context.toefl}/subtest/${context.toeflSubtest}/${context.subtest}`);
    };

    useEffect(() => {
        if (method === 'preview') {
            setDisabled(true);
        }
    }, []);

    useEffect(() => {
        if (!passage) {
            setTextPassage('');
            return;
        }

        const isJSON = (text: string): boolean => {
            try {
                JSON.parse(text);
                return true;
            } catch {
                return false;
            }
        };

        if (isJSON(passage.text)) {
            const parsed = JSON.parse(passage.text);
            const actorMap: Record<string, string> = {};
            parsed.actors.forEach((a: any) => {
                actorMap[a.id] = a.name;
            });

            const formatted = parsed.dialog.map((d: any) => `${actorMap[d.actor_id] ?? 'Unknown'}: ${cleanText(d.text)}`).join('\n');

            setTextPassage(formatted);
        } else {
            setTextPassage(passage.text ?? '');
        }
    }, [data.passage_id]);

    const choicesFilled = data.choices && Object.values(data.choices).every((choice) => choice && choice.trim() !== '');

    return (
        <form onSubmit={submit} className="space-y-6 rounded border bg-gray-50 p-6">
            {/* TITLE & SUBTEST */}
            <div className="flex w-full gap-4">
                <div className="w-1/3">
                    <div className="flex flex-col gap-2">
                        <label className="w-max">ID Toefl</label>
                        <input className="w-full rounded border px-3 py-2" disabled value={context.toefl} />
                        {errors.toefl_subtest_id && <p className="text-sm text-red-500">{errors.toefl_subtest_id}</p>}
                        <label className="w-max">ID Subtest</label>
                        <input className="w-full rounded border px-3 py-2" disabled value={context.subtest} />
                        {errors.toefl_subtest_id && <p className="text-sm text-red-500">{errors.toefl_subtest_id}</p>}
                        <label className="w-max">Order (No)</label>
                        <input
                            className="rounded border px-3 py-2"
                            type="number"
                            value={data.order}
                            min={lastQuestion}
                            disabled={disabled}
                            onChange={(e) => setData('order', Number(e.target.value))}
                        />
                        {errors.order && <p className="text-sm text-red-500">{errors.order}</p>}
                        <label className="w-max">Passage</label>
                        <select
                            className="w-full rounded border px-3 py-2"
                            value={data.passage_id ?? ''}
                            disabled={disabled}
                            onChange={(e) => {
                                setData('passage_id', e.target.value ? Number(e.target.value) : null);
                            }}
                        >
                            <option value="">Select Passage</option>
                            {/* option from backend */}
                            {passages.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.title}
                                </option>
                            ))}
                        </select>
                        {errors.passage_id && <p className="text-sm text-red-500">{errors.passage_id}</p>}
                    </div>
                </div>

                <textarea className="w-full rounded border border-gray-200 p-2" disabled value={textPassage} rows={12} />
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex w-full gap-2">
                    <div className="flex w-4/5 flex-col gap-2">
                        <label className="w-max">Question</label>
                        <input
                            className="w-full rounded border px-3 py-2"
                            placeholder="Question"
                            value={data.question}
                            disabled={disabled}
                            onChange={(e) => setData('question', e.target.value)}
                        />
                        {errors.question && <p className="text-sm text-red-500">{errors.question}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label>Point</label>
                        <input
                            type="number"
                            className="w-full rounded border p-2"
                            placeholder="Point"
                            value={data.point}
                            disabled={disabled || data.question_type === 'essay'}
                            min={0}
                            onChange={(e) => setData('point', Number(e.target.value))}
                        />
                        {errors.point && <p className="text-sm text-red-500">{errors.point}</p>}
                    </div>
                    <div className="flex w-1/5 flex-col gap-2">
                        <label>Question Type</label>
                        <select
                            className="rounded border px-3 py-2"
                            value={data.question_type}
                            disabled={disabled}
                            onChange={(e) => setData('question_type', e.target.value)}
                        >
                            <option value="">-- Select Type --</option>
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="written">Written</option>
                            <option value="essay">Short Essay ( 5-20 words )</option>
                        </select>
                        {errors.question_type && <p className="text-sm text-red-500">{errors.question_type}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    {data.question_type === 'multiple_choice' && (
                        <div className="space-y-3">
                            <label className="font-medium">Choices</label>
                            {errors.choices && <p className="text-sm text-red-500">{errors.choices}</p>}
                            {errors.correct_answer && <p className="text-sm text-red-500">{errors.correct_answer}</p>}
                            <div className="grid grid-cols-2 gap-3">
                                {(['A', 'B', 'C', 'D'] as const).map((key) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <input
                                            className="w-full rounded border px-3 py-2"
                                            placeholder={`Choice ${key}`}
                                            value={data.choices[key]}
                                            disabled={disabled}
                                            onChange={(e) =>
                                                setData('choices', {
                                                    ...data.choices,
                                                    [key]: e.target.value,
                                                })
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setData('correct_answer', key)}
                                            disabled={disabled}
                                            className={`rounded px-3 py-2 text-sm text-white ${
                                                data.correct_answer === key ? 'bg-green-600' : 'bg-gray-400'
                                            }`}
                                        >
                                            {data.correct_answer === key ? 'Correct' : 'Set'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.question_type === 'written' && (
                        <div className="space-y-3">
                            <label className="font-medium">Question View</label>
                            {/* <input className="w-full rounded border px-3 py-2" placeholder="Question View" value={data.question} disabled /> */}
                            {choicesFilled ? (
                                <div
                                    className="w-full rounded border bg-gray-100 p-3"
                                    dangerouslySetInnerHTML={{
                                        __html: renderSentence(data.question, Object.values(data.choices)),
                                    }}
                                />
                            ) : (
                                <div className="rounded border border-dashed p-3 text-sm text-gray-400">
                                    Fill all choices to preview the question.
                                </div>
                            )}
                            <label className="font-medium">
                                Choices <span className="text-gray-400">( check if there is a space after the word )</span>
                            </label>
                            {errors.choices && <p className="text-sm text-red-500">{errors.choices}</p>}
                            {errors.correct_answer && <p className="text-sm text-red-500">{errors.correct_answer}</p>}
                            <div className="grid grid-cols-2 gap-3">
                                {(['A', 'B', 'C', 'D'] as const).map((key) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <input
                                            className="w-full rounded border px-3 py-2"
                                            placeholder={`Choice ${key}`}
                                            value={data.choices[key]}
                                            disabled={disabled}
                                            onChange={(e) =>
                                                setData('choices', {
                                                    ...data.choices,
                                                    [key]: e.target.value,
                                                })
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setData('correct_answer', key)}
                                            disabled={disabled}
                                            className={`rounded px-3 py-2 text-sm text-white ${
                                                data.correct_answer === key ? 'bg-green-600' : 'bg-gray-400'
                                            }`}
                                        >
                                            {data.correct_answer === key ? 'Correct' : 'Set'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ESSAY */}
                    {data.question_type === 'essay' && (
                        <div className="flex items-center gap-5">
                            <div className="flex w-full flex-col items-start gap-2">
                                <label>Model Answer</label>
                                <textarea
                                    className="w-full rounded border p-2"
                                    placeholder="Input Answer Here . . ."
                                    value={data.keywords}
                                    disabled={disabled}
                                    onChange={(e) => setData('keywords', e.target.value)}
                                />
                                {errors.correct_answer && <p className="text-sm text-red-500">{errors.correct_answer}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ACTION */}
            <div className="flex justify-center gap-3">
                <button type="button" onClick={handleBack} className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white">
                    Back
                </button>

                {method !== 'preview' && (
                    <button type="submit" disabled={processing} className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white">
                        Save
                    </button>
                )}
            </div>
        </form>
    );
}
