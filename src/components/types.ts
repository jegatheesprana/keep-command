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
};

export type Command = ColumnItem & {
    command: string;
    description: string;
};

export type Category = ColumnItem & {
    title: string;
    description: string;
    commands: Command[];
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
