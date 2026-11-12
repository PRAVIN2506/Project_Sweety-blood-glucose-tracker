import type { Report } from "../reportsTypes";

interface ReportSummaryCardsProps {
    report: Report;
}

function ReportSummaryCards({ report }: ReportSummaryCardsProps) {
    const cards = [
        {
            label: "Total readings",
            value: String(report.count),
            unit: "",
        },
        {
            label: "Highest glucose",
            value: report.highest === null
                ? "—"
                : String(report.highest),
            unit: report.highest === null ? "" : "mg/dL",
        },
        {
            label: "Lowest glucose",
            value: report.lowest === null
                ? "—"
                : String(report.lowest),
            unit: report.lowest === null ? "" : "mg/dL",
        },
        {
            label: "Average glucose",
            value: report.average === null
                ? "—"
                : report.average.toFixed(1),
            unit: report.average === null ? "" : "mg/dL",
        },
    ];

    return (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <p className="text-sm font-medium text-slate-500">
                        {card.label}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                        {card.value}

                        {card.unit && (
                            <span className="ml-1 text-sm font-normal text-slate-500">
                                {card.unit}
                            </span>
                        )}
                    </p>
                </div>
            ))}
        </section>
    );
}

export default ReportSummaryCards;