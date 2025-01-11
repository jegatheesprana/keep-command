import { Active, DataRef, Over } from "@dnd-kit/core";
import { ColumnDragData, TaskDragData } from "./types";

type DraggableData = ColumnDragData | TaskDragData;

export function hasDraggableData<T extends Active | Over>(
    entry: T | null | undefined
): entry is T & {
    data: DataRef<DraggableData>;
} {
    if (!entry) {
        return false;
    }

    const data = entry.data.current;

    if (data?.type === "Column" || data?.type === "ColumnItem") {
        return true;
    }

    return false;
}
