import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link, useParams } from "react-router-dom";

import BoardContainer from "./BoardColumn";
import CategoryColumn from "./category/CategoryColumn";
import CommandColumn from "./command/CommandColumn";
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    useSensor,
    useSensors,
    KeyboardSensor,
    Announcements,
    UniqueIdentifier,
    TouchSensor,
    MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";
import CategoryCard from "./category/CategoryCard";
import CommandCard from "./command/CommandCard";
import { type Category, type Column, ColumnType, type Command } from "./types";

const categoryColumn: Column = {
    id: ColumnType.Category,
    title: "Category",
};

const commandColumn: Column = {
    id: ColumnType.Command,
    title: "Command",
};

const initialCategories: Category[] = [
    {
        id: "item1",
        title: "Project initiation and planning",
        description: "Tasks related to project initiation and planning",
        commands: [
            {
                id: "item6",
                command: "cd ../",
                description: "Implement user authentication",
            },
            {
                id: "item7",
                command: "cd ../",
                description: "Build contact us page",
            },
            {
                id: "item8",
                command: "cd ../",
                description: "Create product catalog",
            },
        ] satisfies Command[],
    },
    {
        id: "item2",
        title: "Gather requirements from stakeholders",
        description: "Tasks related to project initiation and planning",
        commands: [
            {
                id: "item9",
                command: "cd ../",
                description: "Develop about us page",
            },
            {
                id: "item10",
                command: "cd ../",
                description: "Optimize website for mobile devices",
            },
            {
                id: "item11",
                command: "cd ../",
                description: "Integrate payment gateway",
            },
            {
                id: "item12",
                command: "cd ../",
                description: "Perform testing and bug fixing",
            },
            {
                id: "item13",
                command: "cd ../",
                description: "Launch website and deploy to server",
            },
        ] satisfies Command[],
    },
    {
        id: "item3",
        title: "Create wireframes and mockups",
        description: "Tasks related to project initiation and planning",
        commands: [],
    },
    {
        id: "item4",
        title: "Develop homepage layout",
        description: "Tasks related to project initiation and planning",
        commands: [],
    },
    {
        id: "item5",
        title: "Design color scheme and typography",
        description: "Tasks related to project initiation and planning",
        commands: [],
    },
];

export default function KanbanBoard() {
    const [leftColumn, setLeftColumn] = useState<ColumnType>(ColumnType.Category);
    const pickedUpTaskColumn = useRef<ColumnType | null>(null);

    const navigate = useNavigate();
    const { categoryId } = useParams();

    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const commands = useMemo(() => {
        const selectedCategory = categories.find((category) => category.id === categoryId);
        return selectedCategory?.commands || [];
    }, [categories, categoryId]);

    const [activeColumn, setActiveColumn] = useState<string | null>(null);

    const [activeItem, setActiveItem] = useState<{ column: ColumnType; id: string } | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: coordinateGetter,
        })
    );

    useEffect(() => {
        if (!categoryId) {
            navigate(`/${categories[0].id}`);
        }
    }, []);

    function getDraggingTaskData(itemId: UniqueIdentifier, columnType: ColumnType) {
        const itemsInColumn = columnType === ColumnType.Category ? categories : commands;
        const itemPosition = itemsInColumn.findIndex((item) => item.id === itemId);
        const column = columnType === ColumnType.Category ? categoryColumn : commandColumn;
        return {
            itemsInColumn,
            itemPosition,
            column,
        };
    }

    const announcements: Announcements = {
        onDragStart({ active }) {
            if (!hasDraggableData(active)) return;
            if (active.data.current?.type === "Column") {
                const startColumn = active.id === ColumnType.Category ? categoryColumn : commandColumn;
                return `Picked up Column ${startColumn?.title} at position: ${active.id}`;
            } else if (active.data.current?.type === "ColumnItem") {
                pickedUpTaskColumn.current = active.data.current.columnType;
                const { itemsInColumn, itemPosition, column } = getDraggingTaskData(
                    active.id,
                    pickedUpTaskColumn.current || ColumnType.Command
                );
                return `Picked up ColumnItem ${active.data.current.id} at position: ${itemPosition + 1} of ${
                    itemsInColumn.length
                } in column ${column?.title}`;
            }
        },
        onDragOver({ active, over }) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) return;

            if (active.data.current?.type === "Column" && over.data.current?.type === "Column") {
                return `Column ${active.data.current.column.title} was moved over ${over.data.current.column.title} at position ${over.id}`;
            } else if (active.data.current?.type === "ColumnItem" && over.data.current?.type === "ColumnItem") {
                const { itemsInColumn, itemPosition, column } = getDraggingTaskData(
                    over.id,
                    over.data.current.columnType
                );
                if (over.data.current.columnType !== pickedUpTaskColumn.current) {
                    return `ColumnItem ${active.data.current.id} was moved over column ${column?.title} in position ${
                        itemPosition + 1
                    } of ${itemsInColumn.length}`;
                }
                return `ColumnItem was moved over position ${itemPosition + 1} of ${itemsInColumn.length} in column ${
                    column?.title
                }`;
            }
        },
        onDragEnd({ active, over }) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) {
                pickedUpTaskColumn.current = null;
                return;
            }
            if (active.data.current?.type === "Column" && over.data.current?.type === "Column") {
                return `Column ${active.data.current.column.title} was dropped into position over.id`;
            } else if (active.data.current?.type === "ColumnItem" && over.data.current?.type === "ColumnItem") {
                const { itemsInColumn, itemPosition, column } = getDraggingTaskData(
                    over.id,
                    over.data.current.columnType
                );
                if (over.data.current.columnType !== pickedUpTaskColumn.current) {
                    return `ColumnItem was dropped into column ${column?.title} in position ${itemPosition + 1} of ${
                        itemsInColumn.length
                    }`;
                }
                return `ColumnItem was dropped into position ${itemPosition + 1} of ${itemsInColumn.length} in column ${
                    column?.title
                }`;
            }
            pickedUpTaskColumn.current = null;
        },
        onDragCancel({ active }) {
            pickedUpTaskColumn.current = null;
            if (!hasDraggableData(active)) return;
            return `Dragging ${active.data.current?.type} cancelled.`;
        },
    };

    return (
        <DndContext
            accessibility={{
                announcements,
            }}
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <BoardContainer>
                <SortableContext items={[ColumnType.Category, ColumnType.Command]}>
                    {leftColumn === ColumnType.Category ? (
                        <>
                            <CategoryColumn categories={categories} />
                            <CommandColumn commands={commands} />
                        </>
                    ) : (
                        <>
                            <CommandColumn commands={commands} />
                            <CategoryColumn categories={categories} />
                        </>
                    )}
                </SortableContext>
            </BoardContainer>

            {"document" in window &&
                createPortal(
                    <DragOverlay>
                        {activeColumn === ColumnType.Category ? (
                            <CategoryColumn isOverlay categories={categories} />
                        ) : activeColumn === ColumnType.Command ? (
                            <CommandColumn isOverlay commands={commands} />
                        ) : null}
                        {activeItem &&
                            (activeItem.column === ColumnType.Category ? (
                                <CategoryCard
                                    category={categories.find((category) => category.id === activeItem.id) as Category}
                                    isOverlay
                                />
                            ) : (
                                <CommandCard
                                    command={commands.find((command) => command.id === activeItem.id) as Command}
                                    isOverlay
                                />
                            ))}
                    </DragOverlay>,
                    document.body
                )}
        </DndContext>
    );

    function onDragStart(event: DragStartEvent) {
        if (!hasDraggableData(event.active)) return;
        const data = event.active.data.current;
        if (data?.type === "Column") {
            setActiveColumn(data.column.id);
            return;
        }

        if (data?.type === "ColumnItem") {
            setActiveItem({
                column: data.columnType,
                id: data.id as string,
            });
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveItem(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (!hasDraggableData(active)) return;

        const activeData = active.data.current;

        if (activeId === overId) return;

        const isActiveAColumn = activeData?.type === "Column";
        if (!isActiveAColumn) return;

        setLeftColumn((leftColumn) => {
            if (leftColumn === ColumnType.Category) {
                return ColumnType.Command;
            }
            return ColumnType.Category;
        });
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        if (!hasDraggableData(active) || !hasDraggableData(over)) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        const isActiveATask = activeData?.type === "ColumnItem";
        const isOverATask = overData?.type === "ColumnItem";

        if (!isActiveATask) return;

        if (activeData?.columnType !== overData?.columnType) return;

        // Im dropping a ColumnItem over another ColumnItem
        if (isActiveATask && isOverATask) {
            if (activeData?.columnType === ColumnType.Category) {
                setCategories((categories) => {
                    const activeIndex = categories.findIndex((t) => t.id === activeId);
                    const overIndex = categories.findIndex((t) => t.id === overId);

                    return arrayMove(categories, activeIndex, overIndex);
                });
            } else {
                setCategories((categories) => {
                    const selectedCategoryIndex = categories.findIndex((category) => category.id === categoryId);

                    if (selectedCategoryIndex < 0) return categories;

                    const commands = categories[selectedCategoryIndex].commands || [];

                    const activeIndex = commands.findIndex((t) => t.id === activeId);
                    const overIndex = commands.findIndex((t) => t.id === overId);

                    const moved = arrayMove(commands, activeIndex, overIndex);

                    return categories.map((category, index) => {
                        if (index === selectedCategoryIndex) {
                            return {
                                ...category,
                                commands: moved,
                            };
                        }
                        return category;
                    });
                });
            }
        }
    }
}
