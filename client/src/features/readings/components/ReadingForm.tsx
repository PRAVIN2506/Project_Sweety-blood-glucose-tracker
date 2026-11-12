import { useEffect, useState, type FormEvent } from "react";
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

    useEffect(() => {
        setDate(initialReading?.date.slice(0, 10) || getToday());
        setSlot(initialReading?.slot || "MORNING");
        setValue(initialReading ? String(initialReading.value) : "");
        setError("");
    }, [initialReading]);

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
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div>
                <h2 className="text-xl font-semibold text-slate-900">
                    {initialReading ? "Edit reading" : "Add glucose reading"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Record your blood glucose measurement.
                </p>
            </div>

            <div>
                <label htmlFor="reading-date" className="mb-2 block text-sm font-medium text-slate-700">
                    Date
                </label>
                <input
                    id="reading-date"
                    type="date"
                    value={date}
                    max={getToday()}
                    onChange={(event) => setDate(event.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
            </div>

            <div>
                <label htmlFor="reading-slot" className="mb-2 block text-sm font-medium text-slate-700">
                    Reading slot
                </label>
                <select
                    id="reading-slot"
                    value={slot}
                    onChange={(event) => setSlot(event.target.value as ReadingSlot)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                <label htmlFor="reading-value" className="mb-2 block text-sm font-medium text-slate-700">
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
                    placeholder="Example: 110"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                    Accepted range: 40–600 mg/dL.
                </p>
            </div>

            {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Saving..." : initialReading ? "Update reading" : "Save reading"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default ReadingForm;