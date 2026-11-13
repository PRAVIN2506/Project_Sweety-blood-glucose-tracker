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
                ? "N/A"
                : String(report.highest),
            unit: report.highest === null ? "" : "mg/dL",
        },
        {
            label: "Lowest glucose",
            value: report.lowest === null
                ? "N/A"
                : String(report.lowest),
            unit: report.lowest === null ? "" : "mg/dL",
        },
        {
            label: "Average glucose",
            value: report.average === null
                ? "N/A"
                : report.average.toFixed(1),
            unit: report.average === null ? "" : "mg/dL",
        },
    ];

    return (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-lg border border-border-strong bg-surface p-4"
                >
                    <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                        {card.label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-text-primary tabular-nums">
                        {card.value}

                        {card.unit && (
                            <span className="ml-1 text-xs font-normal text-text-muted">
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
