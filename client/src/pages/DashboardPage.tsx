import { useNavigate, Link } from "react-router-dom";
import { Activity, FileBarChart, LogOut, PlusCircle } from "lucide-react";

import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";

import { logout } from "../features/auth/authSlice";
import { clearReadings } from "../features/readings/readingsSlice";

function DashboardPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const user = useAppSelector((state) => state.auth.user);

    const handleLogout = async () => {
        await dispatch(logout());

        dispatch(clearReadings());

        navigate("/login", { replace: true });
    };

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        to="/dashboard"
                        className="text-xl font-bold text-indigo-600"
                    >
                        Sweety
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                        <LogOut size={17} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Dashboard content */}
            <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
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

                {/* Feature cards */}
                <section className="grid gap-6 md:grid-cols-2">
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

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <FileBarChart size={24} />
                        </div>

                        <h2 className="mt-5 text-xl font-semibold text-slate-900">
                            Glucose reports
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Review daily, month-to-date, and monthly glucose statistics.
                        </p>

                        <span className="mt-6 inline-block rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500">
                            Coming next
                        </span>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default DashboardPage;