import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import CommandCard from "./CommandCard";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { GripVertical, Plus } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { type ColumnDragData, ColumnType, type Command } from "../types";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useParams } from "react-router-dom";

interface BoardColumnProps {
    commands: Command[];
    isOverlay?: boolean;
    onModifyCommand: (id: UniqueIdentifier, command: Command) => void;
    onDeleteClick?: (command: Command) => void;
}

export default function CommandColumn({ commands, isOverlay, onModifyCommand, onDeleteClick }: BoardColumnProps) {
    const [addingCommand, setAddingCommand] = useState(false);
    const commandIds = useMemo(() => {
        return commands.map((command) => command.id);
    }, [commands]);

    const { categoryId } = useParams();

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: ColumnType.Command,
        data: {
            type: "Column",
            column: {
                id: ColumnType.Command,
                title: "Command",
            },
        } satisfies ColumnDragData,
        attributes: {
            roleDescription: `Column: Command`,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const variants = cva("h-full flex-1 max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center", {
        variants: {
            dragging: {
                default: "border-2 border-transparent",
                over: "ring-2 opacity-30",
                overlay: "ring-2 ring-primary",
            },
        },
    });

    const handleAddCommand = () => {
        setAddingCommand(true);
    };

    const handleEditCommand = (id: UniqueIdentifier, command: Command) => {
        onModifyCommand(id, command);
        setAddingCommand(false);
    };

    const onCancleEdit = () => {
        setAddingCommand(false);
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
                        <span className="sr-only">{`Move column: Command`}</span>
                        <GripVertical />
                    </Button>
                    {categoryId && (
                        <Button
                            variant={"ghost"}
                            className="ml-auto bg-secondary p-1 text-primary/50 h-auto relative"
                            onClick={handleAddCommand}
                        >
                            <span className="sr-only">{`Add New Command`}</span>
                            <Plus />
                        </Button>
                    )}
                </CardHeader>
                <ScrollArea>
                    <CardContent className="flex flex-grow flex-col gap-1 p-2">
                        <SortableContext items={commandIds}>
                            {commands.map((command) => (
                                <CommandCard
                                    key={command.id}
                                    command={command}
                                    onModifyCommand={handleEditCommand}
                                    onDeleteClick={onDeleteClick}
                                />
                            ))}
                            {addingCommand && (
                                <CommandCard
                                    command={{ id: "", command: "", description: "" }}
                                    editMode
                                    onCancleEdit={onCancleEdit}
                                    onModifyCommand={handleEditCommand}
                                />
                            )}
                        </SortableContext>
                    </CardContent>
                </ScrollArea>
            </Card>
        </>
    );
}
