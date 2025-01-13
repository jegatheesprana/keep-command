import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical, HelpCircle } from "lucide-react";
import { ColumnType, type TaskDragData, type Category } from "../types";
import { Link } from "react-router-dom";
import Action from "./Action";
import DeleteAlert from "../DeleteAlert";
import { useState } from "react";
import InfoCard from "./InfoCard";
import displayNames from "../../displayNames.json";

interface CategoryCardProps {
    category: Category;
    isOverlay?: boolean;
    onEditClick?: (category: Category) => void;
    onDeleteClick?: (category: Category) => void;
}

export default function CategoryCard({ category, isOverlay, onEditClick, onDeleteClick }: CategoryCardProps) {
    const [deleteAlert, setDeleteAlert] = useState(false);
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

    const handleDeleteClick = () => {
        setTimeout(() => setDeleteAlert(true));
    };

    const handleDeleteSuccess = () => {
        if (!onDeleteClick) return;
        onDeleteClick(category);
    };

    return (
        <>
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
                        {category.description && (
                            <InfoCard content={category.description}>
                                <div className="flex flex-row items-center space-x-1">
                                    <HelpCircle size={15} />
                                </div>
                            </InfoCard>
                        )}
                        {onEditClick && onDeleteClick && (
                            <Action onEditClick={() => onEditClick(category)} onDeleteClick={handleDeleteClick} />
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Link className="block px-3 pt-3 pb-6 text-left whitespace-pre-wrap" to={`/${category.id}`}>
                        {category.title || " "}
                    </Link>
                </CardContent>
            </Card>
            <DeleteAlert
                open={deleteAlert}
                onOpenChange={setDeleteAlert}
                title={`Delete ${displayNames.category.singularCaps}`}
                description={`Are you sure? ${
                    category.title
                        ? `${displayNames.category.singlularSimple}: '${category.title}'`
                        : `This ${displayNames.category.singlularSimple}`
                } will be deleted permanently. The ${category.commands.length} ${
                    displayNames.command.pluralSimple
                } under this ${displayNames.category.singlularSimple} will also be deleted.`}
                onDelete={handleDeleteSuccess}
            />
        </>
    );
}
