import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { ColumnType, Command, TaskDragData } from "../types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
    command: Command;
    isOverlay?: boolean;
}

export default function CommandCard({ command, isOverlay }: TaskCardProps) {
    const [showMore, setShowMore] = useState(false);
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: command.id,
        data: {
            type: "ColumnItem",
            columnType: ColumnType.Command,
            id: command.id,
        } satisfies TaskDragData,
        attributes: {
            roleDescription: "Command",
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

    const handleCopy = () => {
        navigator.clipboard.writeText(command.content);
        alert("Code copied to clipboard!");
    };

    const handleShowMore = () => {
        setShowMore((prev) => !prev);
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={variants({
                dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
            })}
        >
            <CardHeader
                className={cn("p-1 text-left whitespace-pre-wrap", showMore ? "border-b-2 border-secondary" : "")}
            >
                <div className="flex items-center space-x-2">
                    {/* Move Button */}
                    <div className="w-5 rounded-md px-1 py-2">
                        <Button
                            variant={"ghost"}
                            {...attributes}
                            {...listeners}
                            className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
                        >
                            <span className="sr-only">Move command</span>
                            <GripVertical />
                        </Button>
                    </div>

                    {/* Code block */}
                    <pre className="flex-1 resize-none whitespace-pre-wrap rounded-md p-2 border break-words">
                        <code
                            style={{
                                fontFamily: `"Fira Code", "Source Code Pro", "Courier New", monospace`,
                            }}
                        >
                            {command.content}
                        </code>
                    </pre>

                    <div className="flex items-center">
                        {/* Copy Button */}
                        <div className="rounded-md px-1 py-2" onClick={handleCopy}>
                            <Button
                                variant={"ghost"}
                                className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
                            >
                                <span className="sr-only">Move command</span>
                                <Copy size={20} />
                            </Button>
                        </div>

                        {/* Action Button */}
                        <div className="rounded-md px-1 py-2" onClick={handleShowMore}>
                            <Button
                                variant={"ghost"}
                                className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
                            >
                                <span className="sr-only">Move command</span>
                                {showMore ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            {showMore && (
                <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
                    This is used for some changes
                </CardContent>
            )}
        </Card>
    );
}
