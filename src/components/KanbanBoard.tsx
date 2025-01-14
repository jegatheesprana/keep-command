import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";

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

import { v4 as uuidv4 } from "uuid";

const categoryColumn: Column = {
    id: ColumnType.Category,
    title: "Category",
};

const commandColumn: Column = {
    id: ColumnType.Command,
    title: "Command",
};

const DATA_VERSION = "1";
const DATA_KEY = `data-v${DATA_VERSION}`;

const applyFilters = (categories: Category[], keyword: string): Category[] => {
    return categories.filter((category) => {
        if (keyword) {
            let compareTo: string = category.title + " " + category.description;
            for (let command of category.commands) {
                compareTo += " " + command.command + " " + command.description;
            }
            return compareTo.toLocaleLowerCase().includes(keyword.toLocaleLowerCase());
        }

        return true;
    });
};

export default function KanbanBoard() {
    const [leftColumn, setLeftColumn] = useState<ColumnType>(ColumnType.Category);
    const pickedUpTaskColumn = useRef<ColumnType | null>(null);

    const navigate = useNavigate();
    const { categoryId } = useParams();

    const [categories, setCategories] = useState<Category[]>(JSON.parse(localStorage.getItem(DATA_KEY) || "[]"));
    const selectedCategory = useMemo(
        () => categories.find((category) => category.id === categoryId) ?? null,
        [categories, categoryId]
    );

    const [filterKeyword, setFilterKeyword] = useState<string>("");
    const filteredCategories = useMemo(() => applyFilters(categories, filterKeyword), [categories, filterKeyword]);

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
        localStorage.setItem(DATA_KEY, JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        if (!categoryId && categories.length) {
            navigate(`/${categories[0].id}`);
        } else if (categoryId) {
            const category = categories.find((category) => category.id === categoryId);
            if (!category && categories.length) {
                navigate(`/${categories[0].id}`);
            } else if (!category) {
                navigate("/");
            }
        }
    }, [categoryId, categories]);

    function getDraggingTaskData(itemId: UniqueIdentifier, columnType: ColumnType) {
        const itemsInColumn =
            columnType === ColumnType.Category ? categories : selectedCategory ? selectedCategory.commands : [];
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

    function modifyCategory(id: UniqueIdentifier, category: Category): void {
        setCategories((categories) => {
            const index = categories.findIndex((category) => category.id === id);
            if (index === -1) {
                const newId = uuidv4();
                setTimeout(() => navigate(`/${newId}`));
                return [{ ...category, id: newId }, ...categories];
            }
            return [...categories.slice(0, index), category, ...categories.slice(index + 1)];
        });
    }

    function removeCategory(category: Category): void {
        setCategories((categories) => categories.filter((_category) => _category.id !== category.id));
    }

    function modifyCommand(id: UniqueIdentifier, command: Command): void {
        setCategories((categories) => {
            const categoryIndex = categories.findIndex((category) => category.id === categoryId);
            if (categoryIndex === -1) return categories;
            const category = categories[categoryIndex];
            const commandIndex = category.commands.findIndex((command) => command.id === id);
            if (commandIndex === -1) {
                const newId = uuidv4();
                const updatedCommands = [...category.commands, { ...command, id: newId }];
                const updatedCategory = {
                    ...category,
                    commands: updatedCommands,
                };
                return [...categories.slice(0, categoryIndex), updatedCategory, ...categories.slice(categoryIndex + 1)];
            }
            const updatedCommands = [
                ...category.commands.slice(0, commandIndex),
                command,
                ...category.commands.slice(commandIndex + 1),
            ];
            const updatedCategory = {
                ...category,
                commands: updatedCommands,
            };
            return [...categories.slice(0, categoryIndex), updatedCategory, ...categories.slice(categoryIndex + 1)];
        });
    }

    function removeCommand(command: Command): void {
        setCategories((categories) => {
            const categoryIndex = categories.findIndex((category) => category.id === categoryId);
            if (categoryIndex === -1) return categories;
            const category = categories[categoryIndex];
            const commandIndex = category.commands.findIndex((_command) => _command.id === command.id);
            if (commandIndex === -1) return categories;
            const updatedCommands = [
                ...category.commands.slice(0, commandIndex),
                ...category.commands.slice(commandIndex + 1),
            ];
            const updatedCategory = {
                ...category,
                commands: updatedCommands,
            };
            return [...categories.slice(0, categoryIndex), updatedCategory, ...categories.slice(categoryIndex + 1)];
        });
    }

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
            <div className="h-full flex gap-4 items-center flex-row justify-center">
                <SortableContext items={[ColumnType.Category, ColumnType.Command]}>
                    {leftColumn === ColumnType.Category ? (
                        <>
                            <CategoryColumn
                                categories={filteredCategories}
                                modifyCategory={modifyCategory}
                                onDeleteClick={removeCategory}
                                filterKeyword={filterKeyword}
                                setFilterKeyword={setFilterKeyword}
                            />
                            <CommandColumn
                                category={selectedCategory}
                                onModifyCommand={modifyCommand}
                                onDeleteClick={removeCommand}
                            />
                        </>
                    ) : (
                        <>
                            <CommandColumn
                                category={selectedCategory}
                                onModifyCommand={modifyCommand}
                                onDeleteClick={removeCommand}
                            />
                            <CategoryColumn
                                categories={filteredCategories}
                                modifyCategory={modifyCategory}
                                onDeleteClick={removeCategory}
                                filterKeyword={filterKeyword}
                                setFilterKeyword={setFilterKeyword}
                            />
                        </>
                    )}
                </SortableContext>
            </div>

            {"document" in window &&
                createPortal(
                    <DragOverlay>
                        {activeColumn === ColumnType.Category ? (
                            <CategoryColumn
                                isOverlay
                                categories={filteredCategories}
                                modifyCategory={modifyCategory}
                                onDeleteClick={removeCategory}
                                filterKeyword=""
                            />
                        ) : activeColumn === ColumnType.Command ? (
                            <CommandColumn isOverlay category={selectedCategory} onModifyCommand={modifyCommand} />
                        ) : null}
                        {activeItem &&
                            (activeItem.column === ColumnType.Category ? (
                                <CategoryCard
                                    category={categories.find((category) => category.id === activeItem.id) as Category}
                                    isOverlay
                                />
                            ) : (
                                <CommandCard
                                    command={
                                        (selectedCategory &&
                                            selectedCategory.commands.find(
                                                (command) => command.id === activeItem.id
                                            )) as Command
                                    }
                                    isOverlay
                                    onModifyCommand={modifyCommand}
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
