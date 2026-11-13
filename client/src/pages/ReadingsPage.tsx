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
import AppHeader from "../components/layout/AppHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useToast } from "../components/common/useToast";

function ReadingsPage() {
    const dispatch = useAppDispatch();
    const toast = useToast();

    const {
        readings,
        status,
        mutationStatus,
        error,
    } = useAppSelector((state) => state.readings);

    const [editingReading, setEditingReading] = useState<Reading | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");

    // Confirmation dialog state
    const [deletingReading, setDeletingReading] = useState<Reading | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
        dispatch(clearReadingsError());

        try {
            await dispatch(addReading(data)).unwrap();
            toast.success("Reading recorded successfully.");
            setShowForm(false);
            setEditingReading(null);
        } catch (err) {
            const message = typeof err === "string" ? err : "Failed to record reading.";
            toast.error(message);
            throw err;
        }
    };

    const handleEdit = async (data: CreateReadingInput) => {
        if (!editingReading) {
            return;
        }

        dispatch(clearReadingsError());

        try {
            await dispatch(
                editReading({
                    id: editingReading.id,
                    data,
                })
            ).unwrap();
            toast.success("Reading updated successfully.");
            setShowForm(false);
            setEditingReading(null);
        } catch (err) {
            const message = typeof err === "string" ? err : "Failed to update reading.";
            toast.error(message);
            throw err;
        }
    };

    const requestDelete = (reading: Reading) => {
        dispatch(clearReadingsError());
        setDeletingReading(reading);
    };

    const handleConfirmDelete = async () => {
        if (!deletingReading) {
            return;
        }

        setIsDeleting(true);
        dispatch(clearReadingsError());

        try {
            await dispatch(removeReading(deletingReading.id)).unwrap();
            toast.success("Reading deleted successfully.");
            setDeletingReading(null);
        } catch (err) {
            const message = typeof err === "string" ? err : "Failed to delete reading.";
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        if (!isDeleting) {
            setDeletingReading(null);
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
        <div className="min-h-screen bg-canvas">
            <AppHeader />

            <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Page header */}
                <header className="flex flex-col justify-between gap-4 border-b border-border-subtle pb-6 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-text-primary">
                            Glucose readings
                        </h1>

                        <p className="mt-1 text-sm text-text-secondary">
                            Manage and review your blood glucose records.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddForm}
                        className="inline-flex items-center justify-center rounded bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
                    >
                        Add reading
                    </button>
                </header>

                {/* Summary cards */}
                <section className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border-strong bg-surface p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                            Total readings
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-text-primary tabular-nums">
                            {readings.length}
                        </p>
                    </div>

                    <div className="rounded-lg border border-border-strong bg-surface p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                            Average glucose
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-text-primary tabular-nums">
                            {average ?? "N/A"}

                            {average !== null && (
                                <span className="ml-1 text-xs font-normal text-text-muted">
                                    mg/dL
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="rounded-lg border border-border-strong bg-surface p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                            Maximum per day
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-text-primary tabular-nums">
                            4
                        </p>
                    </div>
                </section>

                {/* Add/Edit form */}
                {showForm && (
                    <ReadingForm
                        key={editingReading?.id ?? "new"}
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
                        <h2 className="text-base font-semibold text-text-primary">
                            Reading history
                        </h2>

                        <div className="flex flex-wrap items-center gap-2">
                            <label
                                htmlFor="filter-date"
                                className="text-xs text-text-secondary"
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
                                className="rounded border border-border-strong bg-surface px-2.5 py-1 text-xs text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                            />

                            {selectedDate && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedDate("")}
                                    className="text-xs font-medium text-accent hover:underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Loading state */}
                    {status === "loading" && (
                        <div className="rounded-lg border border-border-strong bg-surface p-8 text-center text-xs text-text-secondary">
                            Loading readings...
                        </div>
                    )}

                    {/* Failed state */}
                    {status === "failed" && (
                        <div className="rounded-lg border border-critical-border bg-critical-bg p-8 text-center">
                            <p className="text-xs font-medium text-critical">
                                {error || "Unable to load readings."}
                            </p>

                            <button
                                type="button"
                                onClick={() => dispatch(fetchReadings())}
                                className="mt-3 text-xs font-medium text-accent hover:underline"
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
                            onDelete={requestDelete}
                        />
                    )}
                </section>
            </main>

            {/* Accessible Confirmation Dialog */}
            <ConfirmDialog
                isOpen={Boolean(deletingReading)}
                title="Delete reading?"
                description="This reading will be permanently deleted. This action cannot be undone."
                confirmLabel="Delete reading"
                cancelLabel="Cancel"
                isDestructive={true}
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
}

export default ReadingsPage;
