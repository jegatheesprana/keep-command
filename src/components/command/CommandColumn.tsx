import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import CommandCard from "./CommandCard";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { GripVertical } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { type ColumnDragData, ColumnType, type Command } from "../types";

interface BoardColumnProps {
    commands: Command[];
    isOverlay?: boolean;
}

export default function CommandColumn({ commands, isOverlay }: BoardColumnProps) {
    const commandIds = useMemo(() => {
        return commands.map((command) => command.id);
    }, [commands]);

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
                    <span className="sr-only">{`Move column: Command`}</span>
                    <GripVertical />
                </Button>
                <span className="ml-auto"> Command</span>
            </CardHeader>
            <ScrollArea>
                <CardContent className="flex flex-grow flex-col gap-2 p-2">
                    <SortableContext items={commandIds}>
                        {commands.map((command) => (
                            <CommandCard key={command.id} command={command} />
                        ))}
                    </SortableContext>
                </CardContent>
            </ScrollArea>
        </Card>
    );
}
