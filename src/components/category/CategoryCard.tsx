import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical, HelpCircle, MoreVertical } from "lucide-react";
import { Badge } from "../ui/badge";
import { ColumnType, type TaskDragData, type Category } from "../types";
import { Link } from "react-router-dom";

interface TaskCardProps {
    category: Category;
    isOverlay?: boolean;
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
                <div className="ml-auto space-between flex flex-row space-x-1">
                    <Badge variant={"outline"} className="font-semibold">
                        <HelpCircle size={15} />
                    </Badge>
                    <Button variant={"ghost"} className="p-1 text-secondary-foreground/50 -ml-2 h-auto">
                        <MoreVertical />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
                <Link to={`/${category.id}`}>{category.title}</Link>
            </CardContent>
        </Card>
    );
}
