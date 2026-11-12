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
            month: "long",
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
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* Header */}
                <header>
                    <p className="text-sm font-medium text-indigo-600">
                        SWEETY / ANALYTICS
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Glucose reports
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Review your blood glucose statistics and reading history.
                    </p>
                </header>

                {/* Date selection */}
                <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Report reference date
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
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
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                </section>

                {/* Report tabs */}
                <ReportTypeTabs
                    activeType={activeType}
                    onChange={setActiveType}
                />

                {/* Active report */}
                <section className="space-y-5">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            {reportLabels[activeType]}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Reference date: {formatDate(selectedDate)}
                        </p>
                    </div>

                    {currentStatus === "loading" && (
                        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                            Loading {reportLabels[activeType].toLowerCase()}...
                        </div>
                    )}

                    {currentStatus === "failed" && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                            <p role="alert" className="text-sm text-red-700">
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
                                className="mt-3 text-sm font-semibold text-red-700 hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {currentStatus === "succeeded" && currentReport && (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                                <p className="text-sm text-slate-500">
                                    Report period
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    {formatDate(currentReport.startDate)}
                                    {" — "}
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
            </div>
        </main>
    );
}

export default ReportsPage;