import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import CategoryCard, { Task } from "./CategoryCard";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { GripVertical } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { ColumnType, type Column } from "../KanbanBoard";

export interface ColumnDragData {
    type: "Column";
    column: Column;
}

interface BoardColumnProps {
    categories: Task[];
    isOverlay?: boolean;
}

export default function CategoryColumn({ categories, isOverlay }: BoardColumnProps) {
    const categoryIds = useMemo(() => {
        return categories.map((category) => category.id);
    }, [categories]);

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: ColumnType.Category,
        data: {
            type: "Column",
            column: {
                id: ColumnType.Category,
                title: "Category",
            },
        } satisfies ColumnDragData,
        attributes: {
            roleDescription: `Column: Category`,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const variants = cva(
        "h-[500px] max-h-[500px] w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center",
        {
            variants: {
                dragging: {
                    default: "border-2 border-transparent",
                    over: "ring-2 opacity-30",
                    overlay: "ring-2 ring-primary",
                },
            },
        }
    );

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={variants({
                dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
            })}
        >
            <CardHeader className="p-4 font-semibold border-b-2 text-left flex flex-row space-between items-center">
                <Button
                    variant={"ghost"}
                    {...attributes}
                    {...listeners}
                    className=" p-1 text-primary/50 -ml-2 h-auto cursor-grab relative"
                >
                    <span className="sr-only">{`Move column: Category`}</span>
                    <GripVertical />
                </Button>
                <span className="ml-auto"> Category</span>
            </CardHeader>
            <ScrollArea>
                <CardContent className="flex flex-grow flex-col gap-2 p-2">
                    <SortableContext items={categoryIds}>
                        {categories.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </SortableContext>
                </CardContent>
            </ScrollArea>
        </Card>
    );
}
