import { useState, type FormEvent } from "react";
import type {
    CreateReadingInput,
    Reading,
    ReadingSlot,
} from "../readingsTypes";

interface ReadingFormProps {
    initialReading?: Reading | null;
    readings: Reading[];
    loading: boolean;
    onSubmit: (data: CreateReadingInput) => Promise<void>;
    onCancel: () => void;
}

const slots: { value: ReadingSlot; label: string }[] = [
    { value: "MORNING", label: "Morning fasting" },
    { value: "AFTER_BREAKFAST", label: "After breakfast" },
    { value: "AFTER_LUNCH", label: "After lunch" },
    { value: "AFTER_DINNER", label: "After dinner" },
];

const getToday = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60_000)
        .toISOString()
        .slice(0, 10);
};

function ReadingForm({
    initialReading,
    readings,
    loading,
    onSubmit,
    onCancel,
}: ReadingFormProps) {
    const [date, setDate] = useState(
        initialReading?.date.slice(0, 10) || getToday()
    );
    const [slot, setSlot] = useState<ReadingSlot>(
        initialReading?.slot || "MORNING"
    );
    const [value, setValue] = useState(
        initialReading ? String(initialReading.value) : ""
    );
    const [error, setError] = useState("");

    const usedSlots = readings
        .filter(
            (reading) =>
                reading.date.slice(0, 10) === date &&
                reading.id !== initialReading?.id
        )
        .map((reading) => reading.slot);

    const isDateValid = date <= getToday();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        const numericValue = Number(value);

        if (!date) {
            setError("Please select a date.");
            return;
        }

        if (!isDateValid) {
            setError("Date cannot be in the future.");
            return;
        }

        if (!Number.isInteger(numericValue) || numericValue < 40 || numericValue > 600) {
            setError("Enter a whole number between 40 and 600 mg/dL.");
            return;
        }

        if (usedSlots.includes(slot)) {
            setError("A reading already exists for this slot and date.");
            return;
        }

        if (
            !initialReading &&
            readings.filter((reading) => reading.date.slice(0, 10) === date).length >= 4
        ) {
            setError("You can add only 4 readings per day.");
            return;
        }

        try {
            await onSubmit({ date, slot, value: numericValue });
        } catch {
            // The Redux error is displayed by the parent page.
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border border-border-strong bg-surface p-6"
        >
            <div className="border-b border-border-subtle pb-3">
                <h2 className="text-base font-semibold text-text-primary">
                    {initialReading ? "Edit reading" : "Add glucose reading"}
                </h2>
                <p className="mt-0.5 text-xs text-text-secondary">
                    Record your blood glucose measurement.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                    <label htmlFor="reading-date" className="mb-1.5 block text-xs font-medium text-text-secondary">
                        Date
                    </label>
                    <input
                        id="reading-date"
                        type="date"
                        value={date}
                        max={getToday()}
                        onChange={(event) => setDate(event.target.value)}
                        required
                        className="w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                </div>

                <div>
                    <label htmlFor="reading-slot" className="mb-1.5 block text-xs font-medium text-text-secondary">
                        Reading slot
                    </label>
                    <select
                        id="reading-slot"
                        value={slot}
                        onChange={(event) => setSlot(event.target.value as ReadingSlot)}
                        required
                        className="w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    >
                        {slots.map((item) => {
                            const disabled =
                                usedSlots.includes(item.value) &&
                                item.value !== initialReading?.slot;

                            return (
                                <option
                                    key={item.value}
                                    value={item.value}
                                    disabled={disabled}
                                >
                                    {item.label}{disabled ? " (already recorded)" : ""}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <label htmlFor="reading-value" className="mb-1.5 block text-xs font-medium text-text-secondary">
                        Glucose value (mg/dL)
                    </label>
                    <input
                        id="reading-value"
                        type="number"
                        min={40}
                        max={600}
                        step={1}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder="e.g. 110"
                        required
                        className="w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                    <p className="mt-1 text-xs text-text-muted">
                        Accepted range: 40 to 600 mg/dL.
                    </p>
                </div>
            </div>

            {error && (
                <div role="alert" className="rounded border border-critical-border bg-critical-bg p-3 text-xs text-critical">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Saving..." : initialReading ? "Update reading" : "Save reading"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default ReadingForm;
