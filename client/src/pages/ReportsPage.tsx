import { useEffect, useState } from "react";

import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";

import {
    fetchReport,
    setSelectedDate,
} from "../features/reports/reportsSlice";

import type {
    Report,
    ReportType,
} from "../features/reports/reportsTypes";

import ReportTypeTabs from "../features/reports/components/ReportTypeTabs";
import ReportSummaryCards from "../features/reports/components/ReportSummaryCards";
import ReportReadingsTable from "../features/reports/components/ReportReadingsTable";
import AppHeader from "../components/layout/AppHeader";

const reportLabels: Record<ReportType, string> = {
    daily: "Daily report",
    "month-to-date": "Month-to-date report",
    monthly: "Previous month report",
};

const getToday = (): string => {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60_000)
        .toISOString()
        .slice(0, 10);
};

function formatDate(date: string): string {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function ReportsPage() {
    const dispatch = useAppDispatch();

    const {
        daily,
        monthToDate,
        monthly,
        status,
        errors,
        selectedDate,
    } = useAppSelector((state) => state.reports);

    const [activeType, setActiveType] = useState<ReportType>("daily");

    useEffect(() => {
        const requests = [
            dispatch(fetchReport({
                type: "daily",
                date: selectedDate,
            })),

            dispatch(fetchReport({
                type: "month-to-date",
                date: selectedDate,
            })),

            dispatch(fetchReport({
                type: "monthly",
                date: selectedDate,
            })),
        ];

        return () => {
            requests.forEach((request) => request.abort());
        };
    }, [dispatch, selectedDate]);

    const reports: Record<ReportType, Report | null> = {
        daily,
        "month-to-date": monthToDate,
        monthly,
    };

    const currentReport = reports[activeType];
    const currentStatus = status[activeType];
    const currentError = errors[activeType];

    const handleDateChange = (date: string) => {
        dispatch(setSelectedDate(date));
    };

    return (
        <div className="min-h-screen bg-canvas">
            <AppHeader />

            <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="border-b border-border-subtle pb-6">
                    <h1 className="text-2xl font-semibold text-text-primary">
                        Glucose reports
                    </h1>

                    <p className="mt-1 text-sm text-text-secondary">
                        Review your blood glucose statistics and reading history.
                    </p>
                </header>

                {/* Date selection */}
                <section className="flex flex-col justify-between gap-4 rounded-lg border border-border-strong bg-surface p-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-sm font-semibold text-text-primary">
                            Report reference date
                        </h2>

                        <p className="mt-0.5 text-xs text-text-secondary">
                            Select a date to calculate all three report periods.
                        </p>
                    </div>

                    <input
                        type="date"
                        value={selectedDate}
                        max={getToday()}
                        onChange={(event) =>
                            handleDateChange(event.target.value)
                        }
                        className="rounded border border-border-strong bg-surface px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                </section>

                {/* Report tabs */}
                <ReportTypeTabs
                    activeType={activeType}
                    onChange={setActiveType}
                />

                {/* Active report */}
                <section className="space-y-4">
                    <div className="border-b border-border-subtle pb-3">
                        <h2 className="text-base font-semibold text-text-primary">
                            {reportLabels[activeType]}
                        </h2>

                        <p className="mt-0.5 text-xs text-text-muted">
                            Reference date: {formatDate(selectedDate)}
                        </p>
                    </div>

                    {currentStatus === "loading" && (
                        <div className="rounded-lg border border-border-strong bg-surface p-8 text-center text-xs text-text-secondary">
                            Loading {reportLabels[activeType].toLowerCase()}...
                        </div>
                    )}

                    {currentStatus === "failed" && (
                        <div className="rounded-lg border border-critical-border bg-critical-bg p-6">
                            <p role="alert" className="text-xs font-medium text-critical">
                                {currentError || "Unable to load this report."}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    dispatch(fetchReport({
                                        type: activeType,
                                        date: selectedDate,
                                    }))
                                }
                                className="mt-3 text-xs font-medium text-accent hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {currentStatus === "succeeded" && currentReport && (
                        <div className="space-y-6">
                            <div className="rounded-lg border border-border-strong bg-surface px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                                    Report period
                                </p>

                                <p className="mt-1 text-sm font-semibold text-text-primary">
                                    {formatDate(currentReport.startDate)}
                                    {" to "}
                                    {formatDate(currentReport.endDate)}
                                </p>
                            </div>

                            <ReportSummaryCards
                                report={currentReport}
                            />

                            <ReportReadingsTable
                                readings={currentReport.readings}
                            />
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default ReportsPage;
