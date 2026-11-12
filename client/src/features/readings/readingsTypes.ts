export type ReadingSlot =
    | "MORNING"
    | "AFTER_BREAKFAST"
    | "AFTER_LUNCH"
    | "AFTER_DINNER";

export interface Reading {
    id: string;
    userId: string;
    date: string;
    slot: ReadingSlot;
    value: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReadingInput {
    date: string;
    slot: ReadingSlot;
    value: number;
}

export interface UpdateReadingInput {
    id: string;
    data: Partial<CreateReadingInput>;
}

export interface ReadingsState {
    readings: Reading[];
    status: "idle" | "loading" | "succeeded" | "failed";
    mutationStatus: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}