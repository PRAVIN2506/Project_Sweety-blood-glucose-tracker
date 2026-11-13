import { Link } from "react-router-dom";

import {
    Activity,
    FileBarChart,
    PlusCircle,
} from "lucide-react";

import AppHeader from "../components/layout/AppHeader";
import { useAppSelector } from "../hooks/useAppSelector";

function DashboardPage() {
    const user = useAppSelector((state) => state.auth.user);

    return (
        <div className="min-h-screen bg-canvas">
            <AppHeader />

            {/* Dashboard content */}
            <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <section>
                    <p className="text-sm font-medium text-indigo-600">
                        YOUR HEALTH TRACKER
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Welcome, {user?.name || "User"}
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Track your glucose readings and review your reports.
                    </p>
                </section>

                <section className="grid gap-6 md:grid-cols-2">

                    {/* Readings */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                            <Activity size={24} />
                        </div>

                        <h2 className="mt-5 text-xl font-semibold text-slate-900">
                            Glucose readings
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Add, edit, delete, and review your daily blood glucose measurements.
                        </p>

                        <Link
                            to="/readings"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                        >
                            <PlusCircle size={17} />
                            Manage readings
                        </Link>
                    </div>

                    {/* Reports */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <FileBarChart size={24} />
                        </div>

                        <h2 className="mt-5 text-xl font-semibold text-slate-900">
                            Glucose reports
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Review daily, month-to-date, and previous-month glucose statistics.
                        </p>

                        <Link
                            to="/reports"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                        >
                            <FileBarChart size={17} />
                            View reports
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default DashboardPage;
