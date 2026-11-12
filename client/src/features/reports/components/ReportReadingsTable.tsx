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
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <h3 className="text-lg font-semibold text-slate-800">
                    No readings found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                    There are no glucose readings for this report period.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-semibold text-slate-900">
                    Reading details
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    {readings.length} recorded reading(s)
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-5 py-4 font-semibold">
                                Date
                            </th>

                            <th className="px-5 py-4 font-semibold">
                                Reading slot
                            </th>

                            <th className="px-5 py-4 font-semibold">
                                Glucose value
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {readings.map((reading) => (
                            <tr
                                key={reading.id}
                                className="hover:bg-slate-50"
                            >
                                <td className="px-5 py-4 text-slate-700">
                                    {formatDate(reading.date)}
                                </td>

                                <td className="px-5 py-4 text-slate-700">
                                    {slotLabels[reading.slot]}
                                </td>

                                <td className="px-5 py-4 font-semibold text-slate-900">
                                    {reading.value} mg/dL
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