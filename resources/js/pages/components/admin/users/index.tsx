import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { User } from 'lucide-react';
import Swal from 'sweetalert2';
import { confirmDialog } from '../../utils/popup-modal';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Props extends PageProps {
    users: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: 'admin/users',
    },
];

export default function UsersIndex({ users }: Props) {
    const handleDelete = async (id: number) => {
        const confirmed = await confirmDialog({
            title: 'Delete user?',
            text: 'User will be permanently removed.',
            confirmText: 'Delete',
            icon: 'warning',
        });

        if (!confirmed) return;

        router.delete(`/admin/users/delete/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'User has been deleted.',
                    icon: 'success',
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Failed!',
                    text: 'Failed to delete user.',
                    icon: 'error',
                });
            },
        });
    };

    const handleRoute = (mode: 'create' | 'edit' | 'delete', id?: number) => {
        switch (mode) {
            case 'create':
                router.visit('/admin/users/create');
                break;

            case 'edit':
                router.get(`/admin/users/edit/${id}`);
                break;

            case 'delete':
                handleDelete(id!);
                break;
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-xl p-4">
                <PageHeader
                    title="Users"
                    icon={<User size={20} />}
                    action={
                        <button
                            onClick={() => handleRoute('create')}
                            className="rounded bg-green-600 px-4 py-2 text-white hover:cursor-pointer hover:bg-green-700"
                        >
                            + Add User
                        </button>
                    }
                >
                    <input type="text" placeholder="Search user..." className="w-64 rounded border px-3 py-2" />
                </PageHeader>

                {/* Table */}
                <div className="overflow-x-auto rounded border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Role</th>
                                <th className="px-4 py-3 text-left">Created_at</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="border-t">
                                        <td className="px-4 py-3">{user.name}</td>
                                        <td className="px-4 py-3">{user.email}</td>
                                        <td className="px-4 py-3">{user.role}</td>
                                        <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Button
                                                onClick={() => handleRoute('edit', user.id)}
                                                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:cursor-pointer hover:bg-blue-700"
                                            >
                                                Edit
                                            </Button>
                                            &nbsp;
                                            <Button
                                                onClick={() => handleRoute('delete', user.id)}
                                                className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:cursor-pointer hover:bg-red-700"
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
