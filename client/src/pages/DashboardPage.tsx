import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import { useAppSelector } from "../hooks/useAppSelector";

function DashboardPage() {
    const user = useAppSelector((state) => state.auth.user);

    return (
        <div className="min-h-screen bg-canvas">
            <AppHeader />

            <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header section */}
                <section className="border-b border-border-subtle pb-6">
                    <h1 className="text-2xl font-semibold text-text-primary">
                        Overview
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Blood glucose tracking and reporting for {user?.name || "Patient"}.
                    </p>
                </section>

                {/* Modules grid */}
                <section className="grid gap-6 md:grid-cols-2">
                    {/* Readings Module */}
                    <div className="flex flex-col justify-between rounded-lg border border-border-strong bg-surface p-6">
                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-text-primary">
                                    Daily Glucose Readings
                                </h2>
                                <span className="rounded border border-border-subtle bg-surface-subtle px-2 py-0.5 text-xs font-medium text-text-secondary">
                                    Tracking
                                </span>
                            </div>

                            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                                Record, update, and review blood glucose measurements across the four daily intervals: Morning fasting, After breakfast, After lunch, and After dinner.
                            </p>

                            <div className="mt-4 border-t border-border-subtle pt-3 text-xs text-text-muted">
                                <p>Standard range: 40 to 600 mg/dL</p>
                                <p className="mt-0.5">Maximum: 4 readings per day</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-2">
                            <Link
                                to="/readings"
                                className="inline-flex items-center justify-center rounded bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
                            >
                                Manage readings
                            </Link>
                        </div>
                    </div>

                    {/* Reports Module */}
                    <div className="flex flex-col justify-between rounded-lg border border-border-strong bg-surface p-6">
                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-text-primary">
                                    Glucose Reports and Analytics
                                </h2>
                                <span className="rounded border border-border-subtle bg-surface-subtle px-2 py-0.5 text-xs font-medium text-text-secondary">
                                    Analytics
                                </span>
                            </div>

                            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                                Generate statistical summaries and track historical trends across Daily, Month-to-date, and Previous-month intervals based on your selected reference date.
                            </p>

                            <div className="mt-4 border-t border-border-subtle pt-3 text-xs text-text-muted">
                                <p>Calculations: Total count, highest, lowest, and average</p>
                                <p className="mt-0.5">Periods: Daily, month-to-date, and monthly</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-2">
                            <Link
                                to="/reports"
                                className="inline-flex items-center justify-center rounded border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-subtle"
                            >
                                View reports
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default DashboardPage;
