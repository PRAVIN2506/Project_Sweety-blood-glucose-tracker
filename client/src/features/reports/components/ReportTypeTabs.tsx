import type { ReportType } from "../reportsTypes";

interface ReportTypeTabsProps {
    activeType: ReportType;
    onChange: (type: ReportType) => void;
}

const tabs: { value: ReportType; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "month-to-date", label: "Month-to-date" },
    { value: "monthly", label: "Previous month" },
];

function ReportTypeTabs({
    activeType,
    onChange,
}: ReportTypeTabsProps) {
    return (
        <div
            role="tablist"
            aria-label="Report type"
            className="flex flex-wrap gap-2"
        >
            {tabs.map((tab) => {
                const active = activeType === tab.value;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(tab.value)}
                        className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${active
                                ? "bg-indigo-600 text-white"
                                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

export default ReportTypeTabs;