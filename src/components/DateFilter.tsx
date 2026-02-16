'use client';

import { Calendar } from 'lucide-react';

interface DateFilterProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onClear: () => void;
}

export default function DateFilter({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onClear,
}: DateFilterProps) {
    const hasFilter = startDate || endDate;

    return (
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="pl-3 pr-2 flex items-center gap-2 text-slate-400 border-r border-slate-100">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Timeframe</span>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 active:bg-white transition-all"
                />
                <span className="text-slate-300">→</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 active:bg-white transition-all"
                />
            </div>

            {hasFilter && (
                <button
                    onClick={onClear}
                    className="ml-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                    Clear
                </button>
            )}
        </div>
    );
}
