import { UniqueIdentifier } from "@dnd-kit/core";

export enum ColumnType {
    Category = "category",
    Command = "command",
}

export interface Column {
    id: ColumnType;
    title: string;
}

export type ColumnItem = {
    id: UniqueIdentifier;
    content: string;
};

export type Command = ColumnItem & {
    content: string;
};

export type Category = ColumnItem & {
    content: string;
};

export type ItemType = "ColumnItem";

export interface TaskDragData {
    type: ItemType;
    columnType: ColumnType;
    id: UniqueIdentifier;
}

export interface ColumnDragData {
    type: "Column";
    column: Column;
}
