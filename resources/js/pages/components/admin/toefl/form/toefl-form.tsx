import { redirectDialog } from '@/pages/components/utils/popup-modal';
import { SubtestMaster, ToeflFormData } from '@/types';
import { router, useForm } from '@inertiajs/react';
import SubtestForm from './subtest-form';

interface ToeflFormProps {
    mode: 'create' | 'edit';
    submitUrl: string;
    subtestMaster: SubtestMaster[];
    initialData?: ToeflFormData;
}

export default function ToeflForm({ mode, submitUrl, initialData, subtestMaster }: ToeflFormProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm<ToeflFormData>({
        name: initialData?.name ?? '',
        code: initialData?.code ?? '',
        subtests: initialData?.subtests ?? [],
    });

    const handleBack = () => {
        router.visit('/admin/toefl', { replace: true });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting TOEFL form with data:', data);

        post(submitUrl, {
            preserveScroll: true,
            onSuccess: async () => {
                const stay = await redirectDialog({
                    title: 'Success',
                    text: 'Do you want to stay on this page?',
                });

                if (stay) {
                    reset();
                } else {
                    router.visit('/admin/toefl', { replace: true });
                }
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* NAME */}
            <div>
                <label className="block text-sm font-medium text-gray-700">TOEFL Name</label>
                <input
                    type="text"
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            {/* Code */}
            <div>
                <label className="block text-sm font-medium text-gray-700">TOEFL Code</label>
                <input
                    type="text"
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <SubtestForm masters={subtestMaster} value={data.subtests} onChange={(subtests) => setData('subtests', subtests)} />

            {/* ACTION */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={handleBack}
                    className="cursor-pointer rounded border bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
                >
                    Back
                </button>

                <button type="submit" disabled={processing} className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    {mode === 'create' ? 'Create TOEFL' : 'Update TOEFL'}
                </button>
            </div>
        </form>
    );
}
