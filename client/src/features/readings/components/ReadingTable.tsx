import type { Reading, ReadingSlot } from "../readingsTypes";

interface ReadingTableProps {
    readings: Reading[];
    onEdit: (reading: Reading) => void;
    onDelete: (reading: Reading) => void;
}

const slotLabels: Record<ReadingSlot, string> = {
    MORNING: "Morning fasting",
    AFTER_BREAKFAST: "After breakfast",
    AFTER_LUNCH: "After lunch",
    AFTER_DINNER: "After dinner",
};

const slotOrder: Record<ReadingSlot, number> = {
    MORNING: 1,
    AFTER_BREAKFAST: 2,
    AFTER_LUNCH: 3,
    AFTER_DINNER: 4,
};

function ReadingTable({
    readings,
    onEdit,
    onDelete,
}: ReadingTableProps) {
    const sortedReadings = [...readings].sort((a, b) => {
        const dateDifference = b.date.localeCompare(a.date);

        if (dateDifference !== 0) return dateDifference;

        return slotOrder[a.slot] - slotOrder[b.slot];
    });

    if (sortedReadings.length === 0) {
        return (
            <div className="rounded-lg border border-border-strong bg-surface p-8 text-center">
                <p className="text-sm font-semibold text-text-primary">
                    No readings found
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                    Add a glucose reading or adjust the date filter.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border-strong bg-surface">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="border-b border-border-subtle bg-surface-subtle text-xs font-semibold text-text-secondary">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Reading slot</th>
                            <th className="px-4 py-3">Glucose</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border-subtle">
                        {sortedReadings.map((reading) => (
                            <tr key={reading.id} className="transition-colors hover:bg-surface-subtle/50">
                                <td className="px-4 py-3 text-text-primary">
                                    {new Date(`${reading.date.slice(0, 10)}T00:00:00`).toLocaleDateString()}
                                </td>

                                <td className="px-4 py-3 text-text-secondary">
                                    {slotLabels[reading.slot]}
                                </td>

                                <td className="px-4 py-3 font-medium text-text-primary tabular-nums">
                                    {reading.value}{" "}
                                    <span className="text-xs font-normal text-text-muted">mg/dL</span>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(reading)}
                                            className="rounded border border-border-strong bg-surface px-2.5 py-1 text-xs font-medium text-text-primary hover:bg-surface-subtle transition"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete(reading)}
                                            className="rounded border border-border-strong bg-surface px-2.5 py-1 text-xs font-medium text-critical hover:border-critical-border hover:bg-critical-bg transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ReadingTable;
