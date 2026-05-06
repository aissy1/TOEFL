import { Button } from '@/components/ui/button';
import { redirectDialog } from '@/pages/components/utils/popup-modal';
import { router, useForm, usePage } from '@inertiajs/react';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';

type Actor = {
    id: string;
    name: string;
    gender: 'male' | 'female';
};

type Part = {
    name: string;
    info: string;
};

type DialogLine = {
    actor_id: string;
    text: string;
};

export default function PassagesForm({ initialData, submitUrl, method = 'post' }: any) {
    const [play, setPlaying] = useState(false);
    const [disabled, setDisable] = useState(false);
    const [selectedPart, setSelectedPart] = useState<string>('A');
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleAudioPlay = (play: boolean) => {
        if (audioRef.current && !play) {
            audioRef.current.play();
            setPlaying(true);
            console.log('status play:', play);
        } else if (audioRef.current && play) {
            audioRef.current.pause();
            setPlaying(false);
            console.log('status play:', play);
        } else {
            setPlaying(false);
        }
    };

    const { subtests } = usePage().props as unknown as {
        subtests: { id: number; name: string }[];
    };

    const { data, setData, post, put, processing, errors, transform, reset, clearErrors } = useForm({
        subtest_id: initialData?.subtest_id ?? '',
        title: initialData?.title ?? '',
        text: initialData?.text ?? '',
        audio_url: initialData?.audio_url ?? '',
    });

    const [part, setPart] = useState<Part[]>([
        { name: 'A', info: 'Short conversations between two people. 1 audio = 1 question. Audio can be played up to 2 times.' },
        { name: 'B', info: 'Longer conversations between two people. 1 audio = multiple questions. Audio can only be played once.' },
        { name: 'C', info: 'Academic talks or lectures by one speaker. 1 audio = multiple questions. Audio can only be played once.' },
    ]);

    const selectPart = part.find((p) => p.name === selectedPart)!;

    const [actors, setActors] = useState<Actor[]>([
        { id: nanoid(), name: 'Subject 1', gender: 'male' },
        { id: nanoid(), name: 'Subject 2', gender: 'female' },
    ]);

    const [dialog, setDialog] = useState<DialogLine[]>([{ actor_id: actors[0].id, text: '' }]);

    const isListening = subtests
        .find((s) => s.id === data.subtest_id)
        ?.name?.toLowerCase()
        .includes('listening');

    /* ---------------- ACTOR HANDLER ---------------- */

    const addActor = () => {
        setActors([...actors, { id: nanoid(), name: '', gender: 'male' }]);
    };

    const updateActor = (id: string, field: keyof Actor, value: string) => {
        setActors(actors.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
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

    const isConvert = isListening && initialData?.audio_url ? true : false;

    /* ---------------- SUBMIT ---------------- */

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const action = method === 'post' ? post : put;

        const onSuccess = async () => {
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
        };

        if (isListening) {
            const textPayload = JSON.stringify({ type: 'listening', part: selectedPart, actors, dialog });

            // transform intercept data sebelum dikirim ke BE
            transform((d) => ({
                ...d,
                text: textPayload,
            }));
        }
        action(submitUrl, {
            onSuccess,
        });
    };

    useEffect(() => {
        if (method === 'preview') {
            setDisable(true);
        }

        // Populate actors & dialog dari initialData saat edit/preview
        if (initialData?.text && isListening) {
            const parsed = JSON.parse(initialData.text);
            if (parsed?.type === 'listening') {
                setActors(parsed.actors ?? []);
                setDialog(parsed.dialog ?? []);
                setSelectedPart(parsed.part ?? 'A');
            }
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

                    <div className="flex flex-col gap-3 rounded border bg-white p-4">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Part :</h3>
                            <select
                                className="rounded border px-2 py-2"
                                value={selectedPart}
                                disabled={disabled}
                                onChange={(e) => setSelectedPart(e.target.value)}
                            >
                                {part.map((p) => (
                                    <option key={p.name} value={p.name}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Information : </h3>
                            <p>{selectPart.info}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">Status :</h3>
                            {isConvert ? (
                                <p className="rounded bg-green-600 px-2 py-1 text-sm font-semibold text-white">Converted</p>
                            ) : (
                                <p className="rounded bg-yellow-100 px-2 py-1 text-sm font-semibold text-yellow-700">Not Converted</p>
                            )}
                            <audio ref={audioRef} src={initialData?.audio_url} onEnded={() => setPlaying(false)} />
                            <Button type="button" disabled={!isConvert} size="sm" onClick={() => handleAudioPlay(play)}>
                                {play ? 'Stop' : 'Play'}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded border bg-white p-4">
                        <h3 className="mb-3 font-semibold">Dialog Subjects</h3>

                        {actors.map((actor, idx) => (
                            <div key={actor.id} className="mb-2 flex gap-2">
                                <input
                                    className="w-full rounded border px-3 py-2"
                                    placeholder={`Subject ${idx + 1}`}
                                    value={actor.name}
                                    disabled={disabled}
                                    onChange={(e) => updateActor(actor.id, 'name', e.target.value)}
                                />

                                {/* Gender Select */}
                                <select
                                    className="w-1/4 rounded border px-2 py-2"
                                    value={actor.gender}
                                    disabled={disabled}
                                    onChange={(e) => updateActor(actor.id, 'gender', e.target.value)}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>

                                {actors.length > 1 && method !== 'preview' && (
                                    <button
                                        type="button"
                                        onClick={() => removeActor(actor.id)}
                                        className="cursor-pointer rounded bg-red-500 px-3 text-white"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        {method !== 'preview' && (
                            <button type="button" onClick={addActor} className="mt-2 cursor-pointer rounded bg-blue-600 px-4 py-2 text-white">
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
                                    <button
                                        type="button"
                                        onClick={() => removeDialog(index)}
                                        className="cursor-pointer rounded bg-red-500 px-3 text-white"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}

                        {method !== 'preview' && (
                            <button type="button" onClick={addDialog} className="mt-2 cursor-pointer rounded bg-blue-600 px-4 py-2 text-white">
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
