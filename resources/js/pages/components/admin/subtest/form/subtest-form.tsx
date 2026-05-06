import { redirectDialog } from '@/pages/components/utils/popup-modal';
import { SubtestFormData } from '@/types';
import { router, useForm } from '@inertiajs/react';

interface SubtestFormProps {
    mode: 'create' | 'edit';
    submitUrl: string;
    initialData?: SubtestFormData;
    method?: 'post' | 'put';
}

export default function SubtestForm({ mode, submitUrl, initialData }: SubtestFormProps) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<SubtestFormData>({
        name: initialData?.name ?? '',
        slug: initialData?.slug ?? '',
        instructions: initialData?.instructions ?? [],
        order: initialData?.order ?? 1,
    });

    const handleBack = () => {
        router.visit('/admin/subtest', { replace: true });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const action = mode === 'create' ? post : put;

        action(submitUrl, {
            onSuccess: async () => {
                const confirmed = await redirectDialog({
                    title: 'Success',
                    text: mode === 'create' ? 'Subtest successfully created. Stay on this page?' : 'Subtest successfully updated. Stay on this page?',
                    confirmText: 'Stay here',
                    cancelText: 'Back to Index',
                    icon: 'success',
                });

                if (!confirmed) {
                    handleBack();
                } else {
                    reset();
                    clearErrors();
                }
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            {/* Name */}
            <div>
                <label className="block text-sm font-medium">Subtest Name</label>
                <input
                    type="text"
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Slug */}
            <div>
                <label className="block text-sm font-medium">Slug</label>
                <input
                    type="text"
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                />
                {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                    <label>Instructions (4-5 Point)</label>
                    <button
                        type="button"
                        onClick={() => setData('instructions', [...(data.instructions ?? []), ''])}
                        className="cursor-pointer text-blue-600 hover:underline"
                    >
                        + Add Instruction
                    </button>
                </div>

                {data.instructions?.map((item, index) => (
                    <input
                        key={index}
                        className="w-full rounded border p-2"
                        placeholder={`Instruction ${index + 1}`}
                        value={item}
                        onChange={(e) => {
                            const updated = [...(data.instructions ?? [])];
                            updated[index] = e.target.value;
                            setData('instructions', updated);
                        }}
                    />
                ))}
            </div>

            {/* Order */}
            <div>
                <label className="block text-sm font-medium">Order</label>
                <input
                    type="number"
                    className="mt-1 w-32 rounded border px-3 py-2"
                    value={data.order}
                    onChange={(e) => setData('order', Number(e.target.value))}
                    min={1}
                />
                {errors.order && <p className="text-sm text-red-500">{errors.order}</p>}
            </div>

            {/* Action */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={handleBack}
                    className="cursor-pointer rounded border bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                    Back
                </button>

                <button type="submit" disabled={processing} className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    {mode === 'create' ? 'Create Subtest' : 'Update Subtest'}
                </button>
            </div>
        </form>
    );
}
