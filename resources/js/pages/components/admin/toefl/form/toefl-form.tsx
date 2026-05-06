import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { redirectDialog } from '@/pages/components/utils/popup-modal';
import { SubtestMaster, ToeflFormData, ToeflSubtest } from '@/types';
import { router, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import SubtestForm from './subtest-form';

interface ToeflFormProps {
    mode: 'create' | 'edit';
    submitUrl: string;
    subtestMaster: SubtestMaster[];
    initialData?: ToeflFormData;
}

export default function ToeflForm({ mode, submitUrl, initialData, subtestMaster }: ToeflFormProps) {
    console.log(initialData?.subtests);
    const normalizeSubtests = (subtests: any[] = []): ToeflSubtest[] => {
        return subtests.map((s) => ({
            subtest_id: s.id,
            order: s.pivot?.order ?? 1,
            duration_minutes: s.pivot?.duration_minutes ?? 0,
            total_questions: s.pivot?.total_questions ?? 0,
            passing_score: s.pivot?.passing_score ?? 0,
        }));
    };

    const { data, setData, post, put, processing, errors, reset } = useForm<ToeflFormData>({
        name: initialData?.name ?? '',
        code: initialData?.code ?? '',
        status: initialData?.status ?? '',
        subtests: initialData?.subtests ? normalizeSubtests(initialData.subtests) : [],
    });

    const handleBack = () => {
        router.visit('/admin/toefl', { replace: true });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const action = mode === 'create' ? post : put;

        action(submitUrl, {
            preserveScroll: true,

            onSuccess: async () => {
                const stay = await redirectDialog({
                    title: 'Success',
                    text: mode === 'create' ? 'TOEFL created successfully. Stay on this page?' : 'TOEFL updated successfully. Stay on this page?',
                    confirmText: 'Yes, stay',
                    cancelText: 'No, go back to index',
                });

                if (stay) {
                    if (mode === 'create') {
                        reset();
                    }
                } else {
                    router.visit('/admin/toefl', { replace: true });
                }
            },

            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: 'Please check the form and try again.',
                });
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
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
            </div>

            {mode === 'edit' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">TOEFL Status</label>

                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                        <SelectTrigger className="mt-1 w-full rounded border px-3 py-2">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                </div>
            )}

            <SubtestForm masters={subtestMaster} value={data.subtests} onChange={(subtests) => setData('subtests', subtests)} />
            {errors.subtests && <p className="mt-1 text-sm text-red-500">{errors.subtests}</p>}

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
