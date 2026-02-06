import { redirectDialog } from '@/pages/components/utils/popup-modal';
import { router, useForm, usePage } from '@inertiajs/react';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';

type Actor = {
    id: string;
    name: string;
};

type DialogLine = {
    actor_id: string;
    text: string;
};

export default function PassagesForm({ initialData, submitUrl, method = 'post' }: any) {
    const [disabled, setDisable] = useState(false);

    const { subtests } = usePage().props as unknown as {
        subtests: { id: number; name: string }[];
    };

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        subtest_id: initialData?.subtest_id ?? '',
        title: initialData?.title ?? '',
        text: initialData?.text ?? '',
    });

    const [actors, setActors] = useState<Actor[]>([
        { id: nanoid(), name: 'Subject 1' },
        { id: nanoid(), name: 'Subject 2' },
    ]);

    const [dialog, setDialog] = useState<DialogLine[]>([{ actor_id: actors[0].id, text: '' }]);

    const isListening = subtests
        .find((s) => s.id === data.subtest_id)
        ?.name?.toLowerCase()
        .includes('listening');

    /* ---------------- ACTOR HANDLER ---------------- */

    const addActor = () => {
        setActors([...actors, { id: nanoid(), name: '' }]);
    };

    const updateActor = (id: string, name: string) => {
        setActors(actors.map((a) => (a.id === id ? { ...a, name } : a)));
    };

    const removeActor = (id: string) => {
        setActors(actors.filter((a) => a.id !== id));
        setDialog(dialog.filter((d) => d.actor_id !== id));
    };

    /* ---------------- DIALOG HANDLER ---------------- */

    const addDialog = () => {
        setDialog([...dialog, { actor_id: actors[0].id, text: '' }]);
    };

    const updateDialog = (index: number, field: keyof DialogLine, value: string) => {
        const updated = [...dialog];
        updated[index][field] = value;
        setDialog(updated);
    };

    const removeDialog = (index: number) => {
        setDialog(dialog.filter((_, i) => i !== index));
    };

    /* ---------------- SUBMIT ---------------- */

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isListening) {
            const payload = {
                type: 'listening',
                actors,
                dialog,
            };

            setData('text', JSON.stringify(payload));
        }

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
                    router.visit('/admin/questions/passage');
                } else {
                    reset();
                    clearErrors();
                }
            },
        });
    };

    useEffect(() => {
        if (method === 'preview') {
            setDisable(true);
            setActors(initialData.actors);
            setDialog(initialData.dialog);
        }
    }, []);

    return (
        <form onSubmit={submit} className="space-y-6 rounded border bg-gray-50 p-6">
            {/* TITLE & SUBTEST */}
            <div className="flex gap-4">
                <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="Title"
                    value={data.title}
                    disabled={disabled}
                    onChange={(e) => setData('title', e.target.value)}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}

                <select
                    className="w-1/3 rounded border px-3 py-2"
                    value={data.subtest_id}
                    disabled={disabled}
                    onChange={(e) => setData('subtest_id', Number(e.target.value))}
                >
                    {disabled ? (
                        <>
                            <option>{initialData.subtest}</option>
                        </>
                    ) : (
                        <>
                            <option value="">-- Select Subtest --</option>
                            {subtests.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </>
                    )}
                </select>
                {errors.subtest_id && <p className="text-sm text-red-500">{errors.subtest_id}</p>}
            </div>

            {/* ================= LISTENING MODE ================= */}

            {isListening ? (
                <>
                    {/* SUBJECT / ACTOR */}
                    <div className="rounded border bg-white p-4">
                        <h3 className="mb-3 font-semibold">Dialog Subjects</h3>

                        {actors.map((actor, idx) => (
                            <div key={actor.id} className="mb-2 flex gap-2">
                                <input
                                    className="w-full rounded border px-3 py-2"
                                    placeholder={`Subject ${idx + 1}`}
                                    value={actor.name}
                                    disabled={disabled}
                                    onChange={(e) => updateActor(actor.id, e.target.value)}
                                />

                                {actors.length > 1 ||
                                    (method !== 'preview' && (
                                        <button type="button" onClick={() => removeActor(actor.id)} className="rounded bg-red-500 px-3 text-white">
                                            ✕
                                        </button>
                                    ))}
                            </div>
                        ))}
                        {method !== 'preview' && (
                            <button type="button" onClick={addActor} className="mt-2 rounded bg-blue-600 px-4 py-2 text-white">
                                + Add Subject
                            </button>
                        )}
                    </div>

                    {/* DIALOG */}
                    <div className="rounded border bg-white p-4">
                        <h3 className="mb-3 font-semibold">Dialog Lines</h3>

                        {dialog.map((d, index) => (
                            <div key={index} className="mb-2 flex gap-2">
                                <select
                                    className="w-1/4 rounded border px-2 py-2"
                                    value={d.actor_id}
                                    disabled={disabled}
                                    onChange={(e) => updateDialog(index, 'actor_id', e.target.value)}
                                >
                                    {actors.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name || 'Unnamed'}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    className="w-full rounded border px-3 py-2"
                                    placeholder="Dialog text..."
                                    value={d.text}
                                    disabled={disabled}
                                    onChange={(e) => updateDialog(index, 'text', e.target.value)}
                                />
                                {method !== 'preview' && (
                                    <button type="button" onClick={() => removeDialog(index)} className="rounded bg-red-500 px-3 text-white">
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}

                        {method !== 'preview' && (
                            <button type="button" onClick={addDialog} className="mt-2 rounded bg-blue-600 px-4 py-2 text-white">
                                + Add Dialog
                            </button>
                        )}
                    </div>
                </>
            ) : (
                /* ================= READING MODE ================= */
                <div>
                    <textarea
                        rows={16}
                        className="w-full rounded border px-3 py-2"
                        placeholder="Passage text..."
                        value={data.text}
                        disabled={disabled}
                        onChange={(e) => setData('text', e.target.value)}
                    />
                    {errors.text && <p className="text-sm text-red-500">{errors.text}</p>}
                </div>
            )}

            {/* ACTION */}
            <div className="flex justify-center gap-3">
                <button
                    type="button"
                    onClick={() => router.visit('/admin/questions/passage')}
                    className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white"
                >
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
