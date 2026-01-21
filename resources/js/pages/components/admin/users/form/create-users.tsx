import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import UserForm from './user-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: 'admin/users',
    },
    {
        title: 'Create',
        href: 'admin/users/create',
    },
];

export default function CreateUser() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Users" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="mb-6 text-2xl font-semibold">Add User</h1>
                <UserForm submitUrl="/admin/users/create" />
            </div>
        </AppLayout>
    );
}
