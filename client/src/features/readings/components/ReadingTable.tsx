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
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="text-lg font-semibold text-slate-800">
                    No readings found
                </p>
                <p className="mt-2 text-sm text-slate-500">
                    Add your first glucose reading to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-5 py-4 font-semibold">Date</th>
                            <th className="px-5 py-4 font-semibold">Reading slot</th>
                            <th className="px-5 py-4 font-semibold">Glucose</th>
                            <th className="px-5 py-4 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {sortedReadings.map((reading) => (
                            <tr key={reading.id} className="hover:bg-slate-50">
                                <td className="px-5 py-4 text-slate-700">
                                    {new Date(`${reading.date.slice(0, 10)}T00:00:00`).toLocaleDateString()}
                                </td>

                                <td className="px-5 py-4 text-slate-700">
                                    {slotLabels[reading.slot]}
                                </td>

                                <td className="px-5 py-4 font-semibold text-slate-900">
                                    {reading.value} mg/dL
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(reading)}
                                            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete(reading)}
                                            className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-600 hover:bg-red-50"
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