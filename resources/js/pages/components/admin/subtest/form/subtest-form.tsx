import { redirectDialog } from '@/pages/components/utils/popup-modal';
import { SubtestFormData } from '@/types';
import { router, useForm } from '@inertiajs/react';

interface SubtestFormProps {
    mode: 'create' | 'edit';
    submitUrl: string;
    initialData?: SubtestFormData;
    method?: 'post' | 'put';
}

export default function SubtestForm({ mode, submitUrl, initialData, method = 'post' }: SubtestFormProps) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<SubtestFormData>({
        name: initialData?.name ?? '',
        slug: initialData?.slug ?? '',
        order: initialData?.order ?? 1,
    });

    const handleBack = () => {
        router.visit('/admin/subtest', { replace: true });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const action = method === 'post' ? post : put;

        action(submitUrl, {
            onSuccess: async () => {
                const confirmed = await redirectDialog({
                    title: 'Success',
                    text:
                        method === 'post'
                            ? 'Data berhasil dibuat. Apakah ingin menambah data lagi?'
                            : 'Data berhasil diperbarui. Tetap di halaman ini?',
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

            {/* Order */}
            <div>
                <label className="block text-sm font-medium">Order</label>
                <input
                    type="number"
                    className="mt-1 w-32 rounded border px-3 py-2"
                    value={data.order}
                    onChange={(e) => setData('order', Number(e.target.value))}
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
