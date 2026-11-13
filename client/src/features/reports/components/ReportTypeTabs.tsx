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
            className="inline-flex flex-wrap gap-1 rounded border border-border-strong bg-surface p-1"
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
                        className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                            active
                                ? "bg-accent text-white"
                                : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
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
