import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import CategoryCard from "./CategoryCard";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { GripVertical, Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { type Category, type ColumnDragData, ColumnType } from "../types";
import AddCategory from "./AddCategory";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSearchParams } from "react-router-dom";
import { SearchInput } from "../ui/input";

interface CategoryColumnProps {
    categories: Category[];
    isOverlay?: boolean;
    modifyCategory: (id: UniqueIdentifier, category: Category) => void;
    onDeleteClick?: (category: Category) => void;
    filterKeyword?: string;
    setFilterKeyword?: (keyword: string) => void;
}

const emptyCategory: Category = {
    id: "",
    title: "",
    description: "",
    commands: [],
};

export default function CategoryColumn({
    categories,
    isOverlay,
    modifyCategory,
    onDeleteClick,
    filterKeyword,
    setFilterKeyword,
}: CategoryColumnProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const modalOpen = searchParams.get("new") === "1";
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

    const setModalOpen = (value: boolean) => {
        setSearchParams({ new: value ? "1" : "0" });
    };

    const variants = cva(
        "h-full overflow-hidden w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center",
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

    const handleEditCategory = (category: Category) => {
        setModalData(category);
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
                <div className="px-2 py-1">
                    <SearchInput
                        placeholder="Type keyword to filter"
                        value={filterKeyword || ""}
                        onChangeValue={setFilterKeyword}
                    />
                </div>
                <ScrollArea>
                    <CardContent className="flex flex-grow flex-col gap-2 p-2">
                        <SortableContext items={categoryIds}>
                            {categories.map((category) => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    onEditClick={handleEditCategory}
                                    onDeleteClick={onDeleteClick}
                                />
                            ))}
                        </SortableContext>
                    </CardContent>
                    <ScrollBar />
                </ScrollArea>
            </Card>
            <AddCategory category={modalData} open={modalOpen} onClose={handleClose} onSuccess={handleSuccess} />
        </>
    );
}
