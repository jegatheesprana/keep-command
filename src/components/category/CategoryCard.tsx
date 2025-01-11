import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical } from "lucide-react";
import { Badge } from "../ui/badge";
import { ColumnType, type ColumnItem } from "../types";

export type Category = ColumnItem & {
    content: string;
};

interface TaskCardProps {
    category: Category;
    isOverlay?: boolean;
}

export type ItemType = "ColumnItem";

export interface TaskDragData {
    type: ItemType;
    columnType: ColumnType;
    id: UniqueIdentifier;
}

export default function CategoryCard({ category, isOverlay }: TaskCardProps) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: category.id,
        data: {
            type: "ColumnItem",
            columnType: ColumnType.Category,
            id: category.id,
        } satisfies TaskDragData,
        attributes: {
            roleDescription: "Category",
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const variants = cva("", {
        variants: {
            dragging: {
                over: "ring-2 opacity-30",
                overlay: "ring-2 ring-primary",
            },
        },
    });

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={variants({
                dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
            })}
        >
            <CardHeader className="px-3 py-3 space-between flex flex-row border-b-2 border-secondary relative">
                <Button
                    variant={"ghost"}
                    {...attributes}
                    {...listeners}
                    className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
                >
                    <span className="sr-only">Move category</span>
                    <GripVertical />
                </Button>
                <Badge variant={"outline"} className="ml-auto font-semibold">
                    Category
                </Badge>
            </CardHeader>
            <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">{category.content}</CardContent>
        </Card>
    );
}
