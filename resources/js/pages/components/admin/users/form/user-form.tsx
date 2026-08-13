import { UserFormData } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { redirectDialog } from '../../../utils/popup-modal';

interface Props {
    initialData?: UserFormData;
    submitUrl: string;
    method?: 'post' | 'put';
}

export default function UserForm({ initialData, submitUrl, method = 'post' }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<UserFormData>({
        name: initialData?.name ?? '',
        email: initialData?.email ?? '',
        role: initialData?.role ?? 'user',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);

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

    const handleBack = () => {
        router.visit('/admin/users', { replace: true });
    };

    return (
        <form onSubmit={submit} className="max-w-xl space-y-5">
            {/* Name */}
            <div>
                <label className="block text-sm font-medium">Name</label>
                <input className="w-full rounded border px-3 py-2" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                    type="email"
                    required
                    className="w-full rounded border px-3 py-2"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Role */}
            <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                    className="w-full rounded border px-3 py-2"
                    value={data.role}
                    required
                    onChange={(e) => setData('role', e.target.value as 'admin' | 'user')}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium">{method === 'put' ? 'New Password (optional)' : 'Password'}</label>
                <input
                    type={method === 'put' && showPassword ? 'text' : 'password'}
                    className="w-full rounded border px-3 py-2"
                    value={data.password}
                    required={method === 'post'}
                    autoComplete="new-password"
                    onChange={(e) => setData('password', e.target.value)}
                />
                {method === 'put' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="mt-2 inline-flex items-center gap-2 text-sm text-gray-500"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        {showPassword ? 'Hide password' : 'Show password'}
                    </button>
                )}
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Password Confirmation */}
            <div>
                <label className="block text-sm font-medium">Confirm Password</label>
                <input
                    type="password"
                    className="w-full rounded border px-3 py-2"
                    value={data.password_confirmation}
                    required={method === 'post'}
                    autoComplete="new-password"
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                />
                {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
            </div>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={handleBack} className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
                    Back
                </button>
                <button type="submit" disabled={processing} className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    {processing ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
}
