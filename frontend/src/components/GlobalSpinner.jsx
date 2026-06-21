import React from 'react';

export default function GlobalSpinner() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
            <div className="relative flex items-center justify-center">
                <div className="absolute animate-ping w-12 h-12 rounded-full bg-primary/20"></div>
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500 animate-pulse">Loading...</p>
        </div>
    );
}
