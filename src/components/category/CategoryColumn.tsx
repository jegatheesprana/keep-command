import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import CategoryCard from "./CategoryCard";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { GripVertical, Plus } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { type Category, type ColumnDragData, ColumnType } from "../types";
import AddCategory from "./AddCategory";
import { UniqueIdentifier } from "@dnd-kit/core";

interface BoardColumnProps {
    categories: Category[];
    isOverlay?: boolean;
    modifyCategory: (id: UniqueIdentifier, category: Category) => void;
}

const emptyCategory: Category = {
    id: "",
    title: "",
    description: "",
    commands: [],
};

export default function CategoryColumn({ categories, isOverlay, modifyCategory }: BoardColumnProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<Category>(emptyCategory);
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

    const handleAddCategory = () => {
        setModalData(emptyCategory);
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
    };

    const handleSuccess = (modifiedCategory: Category): void => {
        modifyCategory(modalData.id, modifiedCategory);
        setModalOpen(false);
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
                    <Button
                        variant={"ghost"}
                        onClick={handleAddCategory}
                        className="ml-auto bg-secondary p-1 text-primary/50 h-auto relative"
                    >
                        <span className="sr-only">{`Add New Command`}</span>
                        <Plus />
                    </Button>
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
            <AddCategory category={modalData} open={modalOpen} onClose={handleClose} onSuccess={handleSuccess} />
        </>
    );
}
