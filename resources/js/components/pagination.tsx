import { router } from '@inertiajs/react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    from: number;
    to: number;
    total: number;
}

export default function Pagination({ currentPage, lastPage, nextPageUrl, prevPageUrl, from, to, total }: PaginationProps) {
    const goToPage = (url: string | null) => {
        if (!url) return;
        router.visit(url, { preserveScroll: true });
    };

    const getPageNumbers = () => {
        const pages = [];
        const delta = 2; // jumlah halaman di kiri & kanan current page
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(lastPage, currentPage + delta);

        if (left > 1) {
            pages.push(1);
            if (left > 2) pages.push('...');
        }

        for (let i = left; i <= right; i++) pages.push(i);

        if (right < lastPage) {
            if (right < lastPage - 1) pages.push('...');
            pages.push(lastPage);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between border-t bg-white px-4 py-3 text-sm text-gray-600">
            {/* Info */}
            <span className="text-xs text-gray-500">
                Showing{' '}
                <span className="font-semibold text-gray-700">
                    {from}–{to}
                </span>{' '}
                of <span className="font-semibold text-gray-700">{total}</span> results
            </span>

            {/* Buttons */}
            <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                    onClick={() => goToPage(prevPageUrl)}
                    disabled={!prevPageUrl}
                    className="cursor-pointer rounded border px-2 py-1 text-xs font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    ← Prev
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, i) =>
                    page === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-gray-400">
                            …
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => router.visit(`?page=${page}`, { preserveScroll: true })}
                            className={`cursor-pointer rounded border px-2.5 py-1 text-xs font-medium transition ${
                                page === currentPage ? 'border-blue-500 bg-blue-500 text-white' : 'hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ),
                )}

                {/* Next */}
                <button
                    onClick={() => goToPage(nextPageUrl)}
                    disabled={!nextPageUrl}
                    className="cursor-pointer rounded border px-2 py-1 text-xs font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
