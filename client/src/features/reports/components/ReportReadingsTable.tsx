import type {
    ReportReading,
} from "../reportsTypes";

import type {
    ReadingSlot,
} from "../../readings/readingsTypes";

interface ReportReadingsTableProps {
    readings: ReportReading[];
}

const slotLabels: Record<ReadingSlot, string> = {
    MORNING: "Morning fasting",
    AFTER_BREAKFAST: "After breakfast",
    AFTER_LUNCH: "After lunch",
    AFTER_DINNER: "After dinner",
};

function formatDate(date: string): string {
    const datePart = date.slice(0, 10);
    const [year, month, day] = datePart.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function ReportReadingsTable({
    readings,
}: ReportReadingsTableProps) {
    if (readings.length === 0) {
        return (
            <div className="rounded-lg border border-border-strong bg-surface p-8 text-center">
                <h3 className="text-sm font-semibold text-text-primary">
                    No readings found
                </h3>

                <p className="mt-1 text-xs text-text-secondary">
                    There are no glucose readings recorded for this report period.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border-strong bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3">
                <h3 className="text-sm font-semibold text-text-primary">
                    Reading details
                </h3>

                <span className="text-xs text-text-muted">
                    {readings.length} recorded reading(s)
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-sm">
                    <thead className="border-b border-border-subtle bg-surface-subtle text-xs font-semibold text-text-secondary">
                        <tr>
                            <th className="px-4 py-2.5">Date</th>
                            <th className="px-4 py-2.5">Reading slot</th>
                            <th className="px-4 py-2.5">Glucose value</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border-subtle">
                        {readings.map((reading) => (
                            <tr
                                key={reading.id}
                                className="transition-colors hover:bg-surface-subtle/50"
                            >
                                <td className="px-4 py-2.5 text-text-primary">
                                    {formatDate(reading.date)}
                                </td>

                                <td className="px-4 py-2.5 text-text-secondary">
                                    {slotLabels[reading.slot]}
                                </td>

                                <td className="px-4 py-2.5 font-medium text-text-primary tabular-nums">
                                    {reading.value}{" "}
                                    <span className="text-xs font-normal text-text-muted">mg/dL</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ReportReadingsTable;
