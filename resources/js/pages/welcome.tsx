import { Button } from '@/components/ui/button';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function Welcome() {
    const { data, setData, post, errors } = useForm({
        username: '',
        password: '',
        packetToefl: '',
    });
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.error, flash?.success]);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!data.username.trim()) {
            alert('Please enter your name');
            return;
        }
        post('/submit-session');
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                {/* Main Card */}
                <div className="relative w-full max-w-md">
                    {/* Decorative background blur */}
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-25 blur"></div>

                    {/* Main content card */}
                    <div className="relative rounded-2xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                        {/* Header Section */}
                        <div className="mb-6 text-center sm:mb-8">
                            {/* Icon */}
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg sm:h-16 sm:w-16">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            </div>

                            {/* Title */}
                            <h1 className="mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                                Welcome to TOEFL Test
                            </h1>
                            <p className="text-xs font-medium text-gray-600 sm:text-sm">
                                Enter your name and choose a TOEFL to begin your assessment
                            </p>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="toefl" className="block text-sm font-semibold text-gray-700">
                                    Packet Toefl
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="toefl"
                                        id="toefl"
                                        value={data.packetToefl}
                                        onChange={(e) => setData('packetToefl', e.target.value)}
                                        placeholder="Enter your packet toefl code . . ."
                                        className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-500 backdrop-blur-sm transition-all duration-200 hover:bg-white/70 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                {errors.packetToefl && <p className="mt-1 text-sm text-red-600">{errors.packetToefl}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="username"
                                        id="username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="Enter your full name . . ."
                                        className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-500 backdrop-blur-sm transition-all duration-200 hover:bg-white/70 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password . . ."
                                        className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-500 backdrop-blur-sm transition-all duration-200 hover:bg-white/70 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <span>Start Test</span>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 border-t border-gray-200/50 pt-4 sm:mt-8 sm:pt-6">
                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                <span>Your information is secure and private</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
