import AppLayout from '@/layouts/app-layout';
import { UserFormData } from '@/types';

import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import UserForm from './user-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: 'admin/users',
    },
    {
        title: 'Edit',
        href: 'admin/users/edit/${user.id}',
    },
];

export default function EditUser({ user }: { user: UserFormData }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Users" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="mb-6 text-2xl font-semibold">Edit User</h1>
                <UserForm submitUrl={`/admin/users/${user.id}`} method="put" initialData={user} />
            </div>
        </AppLayout>
    );
}
