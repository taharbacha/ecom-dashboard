'use client';

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
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date Filter
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm text-slate-400 mb-2">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm text-slate-400 mb-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        onClick={onClear}
                        disabled={!hasFilter}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${hasFilter
                                ? 'bg-slate-700 text-white hover:bg-slate-600'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {!hasFilter && (
                <p className="text-slate-500 text-sm mt-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Showing all time data
                </p>
            )}
        </div>
    );
}
