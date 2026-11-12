import { useEffect, useMemo, useState } from "react";

import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";

import {
    addReading,
    editReading,
    fetchReadings,
    removeReading,
    clearReadingsError,
} from "../features/readings/readingsSlice";

import type {
    CreateReadingInput,
    Reading,
} from "../features/readings/readingsTypes";

import ReadingForm from "../features/readings/components/ReadingForm";
import ReadingTable from "../features/readings/components/ReadingTable";

function ReadingsPage() {
    const dispatch = useAppDispatch();

    const {
        readings,
        status,
        mutationStatus,
        error,
    } = useAppSelector((state) => state.readings);

    const [editingReading, setEditingReading] = useState<Reading | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");

    useEffect(() => {
        dispatch(fetchReadings());
    }, [dispatch]);

    const filteredReadings = useMemo(() => {
        if (!selectedDate) {
            return readings;
        }

        return readings.filter(
            (reading) => reading.date.slice(0, 10) === selectedDate
        );
    }, [readings, selectedDate]);

    const average = useMemo(() => {
        if (readings.length === 0) {
            return null;
        }

        const total = readings.reduce(
            (sum, reading) => sum + reading.value,
            0
        );

        return (total / readings.length).toFixed(1);
    }, [readings]);

    const handleAdd = async (data: CreateReadingInput) => {
        await dispatch(addReading(data)).unwrap();

        setShowForm(false);
        setEditingReading(null);
    };

    const handleEdit = async (data: CreateReadingInput) => {
        if (!editingReading) {
            return;
        }

        await dispatch(
            editReading({
                id: editingReading.id,
                data,
            })
        ).unwrap();

        setShowForm(false);
        setEditingReading(null);
    };

    const handleDelete = async (reading: Reading) => {
        const confirmed = window.confirm(
            `Delete the ${reading.value} mg/dL reading? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        dispatch(clearReadingsError());

        try {
            await dispatch(removeReading(reading.id)).unwrap();
        } catch {
            // The Redux error is displayed on the page.
        }
    };

    const openAddForm = () => {
        dispatch(clearReadingsError());

        setEditingReading(null);
        setShowForm(true);
    };

    const openEditForm = (reading: Reading) => {
        dispatch(clearReadingsError());

        setEditingReading(reading);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingReading(null);

        dispatch(clearReadingsError());
    };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* Page header */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-medium text-indigo-600">
                            SWEETY / TRACKER
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-slate-900">
                            Glucose readings
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Manage and review your blood glucose records.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddForm}
                        className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700"
                    >
                        + Add reading
                    </button>
                </header>

                {/* Summary cards */}
                <section className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-500">
                            Total readings
                        </p>

                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {readings.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-500">
                            Average glucose
                        </p>

                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {average ?? "—"}

                            {average !== null && (
                                <span className="ml-1 text-sm font-normal text-slate-500">
                                    mg/dL
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-500">
                            Maximum readings per day
                        </p>

                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            4
                        </p>
                    </div>
                </section>

                {/* Add/Edit form */}
                {showForm && (
                    <ReadingForm
                        initialReading={editingReading}
                        readings={readings}
                        loading={mutationStatus === "loading"}
                        onSubmit={
                            editingReading ? handleEdit : handleAdd
                        }
                        onCancel={closeForm}
                    />
                )}

                {/* Reading history */}
                <section className="space-y-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Reading history
                        </h2>

                        <div className="flex flex-wrap items-center gap-2">
                            <label
                                htmlFor="filter-date"
                                className="text-sm text-slate-600"
                            >
                                Filter by date:
                            </label>

                            <input
                                id="filter-date"
                                type="date"
                                value={selectedDate}
                                onChange={(event) =>
                                    setSelectedDate(event.target.value)
                                }
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />

                            {selectedDate && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedDate("")}
                                    className="text-sm font-medium text-indigo-600 hover:underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* API error */}
                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    {/* Loading state */}
                    {status === "loading" && (
                        <div className="rounded-xl bg-white p-10 text-center text-slate-500">
                            Loading readings...
                        </div>
                    )}

                    {/* Failed state */}
                    {status === "failed" && (
                        <div className="rounded-xl bg-white p-10 text-center">
                            <p className="text-red-600">
                                {error || "Unable to load readings."}
                            </p>

                            <button
                                type="button"
                                onClick={() => dispatch(fetchReadings())}
                                className="mt-4 font-medium text-indigo-600 hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Success state */}
                    {status === "succeeded" && (
                        <ReadingTable
                            readings={filteredReadings}
                            onEdit={openEditForm}
                            onDelete={handleDelete}
                        />
                    )}
                </section>
            </div>
        </main>
    );
}

export default ReadingsPage;