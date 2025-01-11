import { useRef, useState } from "react";
import { createPortal } from "react-dom";

import { BoardColumn, BoardContainer } from "./BoardColumn";
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
import { type Task, TaskCard } from "./TaskCard";
import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";

export enum ColumnType {
    Category = "category",
    Command = "command",
}

export interface Column {
    id: ColumnType;
    title: string;
}

const categoryColumn: Column = {
    id: ColumnType.Category,
    title: "Category",
};

const commandColumn: Column = {
    id: ColumnType.Command,
    title: "Command",
};

const initialTasks: Task[] = [
    {
        id: "task1",
        columnId: ColumnType.Category,
        content: "Project initiation and planning",
    },
    {
        id: "task2",
        columnId: ColumnType.Category,
        content: "Gather requirements from stakeholders",
    },
    {
        id: "task3",
        columnId: ColumnType.Category,
        content: "Create wireframes and mockups",
    },
    {
        id: "task4",
        columnId: ColumnType.Category,
        content: "Develop homepage layout",
    },
    {
        id: "task5",
        columnId: ColumnType.Category,
        content: "Design color scheme and typography",
    },
    {
        id: "task6",
        columnId: ColumnType.Command,
        content: "Implement user authentication",
    },
    {
        id: "task7",
        columnId: ColumnType.Command,
        content: "Build contact us page",
    },
    {
        id: "task8",
        columnId: ColumnType.Command,
        content: "Create product catalog",
    },
    {
        id: "task9",
        columnId: ColumnType.Command,
        content: "Develop about us page",
    },
    {
        id: "task10",
        columnId: ColumnType.Command,
        content: "Optimize website for mobile devices",
    },
    {
        id: "task11",
        columnId: ColumnType.Command,
        content: "Integrate payment gateway",
    },
    {
        id: "task12",
        columnId: ColumnType.Command,
        content: "Perform testing and bug fixing",
    },
    {
        id: "task13",
        columnId: ColumnType.Command,
        content: "Launch website and deploy to server",
    },
];
export function KanbanBoard() {
    const [leftColumn, setLeftColumn] = useState<ColumnType>(ColumnType.Category);
    const pickedUpTaskColumn = useRef<ColumnType | null>(null);

    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    const [activeColumn, setActiveColumn] = useState<string | null>(null);

    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: coordinateGetter,
        })
    );

    function getDraggingTaskData(taskId: UniqueIdentifier, columnId: ColumnType) {
        const tasksInColumn = tasks.filter((task) => task.columnId === columnId);
        const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
        const column = columnId === ColumnType.Category ? categoryColumn : commandColumn;
        return {
            tasksInColumn,
            taskPosition,
            column,
        };
    }

    const announcements: Announcements = {
        onDragStart({ active }) {
            if (!hasDraggableData(active)) return;
            if (active.data.current?.type === "Column") {
                const startColumn = active.id === ColumnType.Category ? categoryColumn : commandColumn;
                return `Picked up Column ${startColumn?.title} at position: ${active.id}`;
            } else if (active.data.current?.type === "Task") {
                pickedUpTaskColumn.current = active.data.current.task.columnId;
                const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
                    active.id,
                    pickedUpTaskColumn.current
                );
                return `Picked up Task ${active.data.current.task.content} at position: ${taskPosition + 1} of ${
                    tasksInColumn.length
                } in column ${column?.title}`;
            }
        },
        onDragOver({ active, over }) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) return;

            if (active.data.current?.type === "Column" && over.data.current?.type === "Column") {
                return `Column ${active.data.current.column.title} was moved over ${over.data.current.column.title} at position ${over.id}`;
            } else if (active.data.current?.type === "Task" && over.data.current?.type === "Task") {
                const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
                    over.id,
                    over.data.current.task.columnId
                );
                if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
                    return `Task ${active.data.current.task.content} was moved over column ${
                        column?.title
                    } in position ${taskPosition + 1} of ${tasksInColumn.length}`;
                }
                return `Task was moved over position ${taskPosition + 1} of ${tasksInColumn.length} in column ${
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
            } else if (active.data.current?.type === "Task" && over.data.current?.type === "Task") {
                const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
                    over.id,
                    over.data.current.task.columnId
                );
                if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
                    return `Task was dropped into column ${column?.title} in position ${taskPosition + 1} of ${
                        tasksInColumn.length
                    }`;
                }
                return `Task was dropped into position ${taskPosition + 1} of ${tasksInColumn.length} in column ${
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
                            <BoardColumn
                                column={categoryColumn}
                                tasks={tasks.filter((task) => task.columnId === ColumnType.Category)}
                            />
                            <BoardColumn
                                column={commandColumn}
                                tasks={tasks.filter((task) => task.columnId === ColumnType.Command)}
                            />
                        </>
                    ) : (
                        <>
                            <BoardColumn
                                column={commandColumn}
                                tasks={tasks.filter((task) => task.columnId === ColumnType.Command)}
                            />
                            <BoardColumn
                                column={categoryColumn}
                                tasks={tasks.filter((task) => task.columnId === ColumnType.Category)}
                            />
                        </>
                    )}
                </SortableContext>
            </BoardContainer>

            {"document" in window &&
                createPortal(
                    <DragOverlay>
                        {activeColumn === ColumnType.Category ? (
                            <BoardColumn
                                isOverlay
                                column={categoryColumn}
                                tasks={tasks.filter((task) => task.columnId === activeColumn)}
                            />
                        ) : activeColumn === ColumnType.Command ? (
                            <BoardColumn
                                isOverlay
                                column={commandColumn}
                                tasks={tasks.filter((task) => task.columnId === activeColumn)}
                            />
                        ) : null}
                        {activeTask && <TaskCard task={activeTask} isOverlay />}
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

        if (data?.type === "Task") {
            setActiveTask(data.task);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

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

        const isActiveATask = activeData?.type === "Task";
        const isOverATask = overData?.type === "Task";

        if (!isActiveATask) return;

        if (activeData?.task.columnId !== overData?.task?.columnId) return;

        // Im dropping a Task over another Task
        if (isActiveATask && isOverATask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);
                const activeTask = tasks[activeIndex];
                const overTask = tasks[overIndex];
                if (activeTask && overTask && activeTask.columnId !== overTask.columnId) {
                    activeTask.columnId = overTask.columnId;
                    return arrayMove(tasks, activeIndex, overIndex - 1);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        const isOverAColumn = overData?.type === "Column";

        // Im dropping a Task over a column
        if (isActiveATask && isOverAColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const activeTask = tasks[activeIndex];
                if (activeTask) {
                    activeTask.columnId = overId as ColumnType;
                    return arrayMove(tasks, activeIndex, activeIndex);
                }
                return tasks;
            });
        }
    }
}
