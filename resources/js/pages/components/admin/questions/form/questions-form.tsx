import { redirectDialog } from '@/pages/components/utils/popup-modal';
import { type QuestionFormData } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function QuestionsForm({ initialData, submitUrl, method = 'post' }: any) {
    const [disabled, setDisabled] = useState(false);
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
        min_words: initialData?.min_words ?? 200,
        choices: initialData?.choices ?? { A: '', B: '', C: '', D: '' },
        correct_answer: initialData?.correct_answer ?? '',
        keywords: ['', '', ''],
        point: initialData?.point ?? 1,
    });

    const textPassage = passages.find((s) => s.id === data.passage_id)?.text;

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
                    router.visit(`/admin/questions/${context.toefl}/subtest/${context.toeflSubtest}/${context.subtest}`);
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
                            {/* option dari backend */}
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
                            disabled={disabled}
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
                            <option value="essay">Essay</option>
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

                    {/* ESSAY */}
                    {data.question_type === 'essay' && (
                        <div className="flex items-center gap-5">
                            <div className="grid grid-rows-2 gap-2">
                                <label>Min Words</label>
                                <input
                                    type="number"
                                    className="rounded border p-2"
                                    placeholder="Point"
                                    value={data.min_words}
                                    onChange={(e) => setData('min_words', Number(e.target.value))}
                                />
                                {errors.min_words && <p className="text-sm text-red-500">{errors.min_words}</p>}
                            </div>

                            <div className="grid w-full grid-cols-3 gap-4">
                                {data.keywords.map((keyword, index) => (
                                    <div className="grid grid-rows-2 gap-2">
                                        <label>Keywords {index + 1}</label>
                                        <input
                                            key={index}
                                            className="w-full rounded border px-3 py-2"
                                            placeholder={`Keyword ${index + 1}`}
                                            value={keyword}
                                            onChange={(e) => {
                                                const updated = [...data.keywords];
                                                updated[index] = e.target.value;
                                                setData('keywords', updated);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {errors.keywords && <p className="text-sm text-red-500">{errors.keywords}</p>}
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
