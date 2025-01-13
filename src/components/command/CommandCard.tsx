import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical, Copy, CopyCheck, ChevronDown, ChevronUp, Edit, Trash, Check, X } from "lucide-react";
import { ColumnType, Command, TaskDragData } from "../types";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { UniqueIdentifier } from "@dnd-kit/core";
import DeleteAlert from "../DeleteAlert";
import displayNames from "../../displayNames.json";

interface TaskCardProps {
    command: Command;
    isOverlay?: boolean;
    editMode?: boolean;
    onModifyCommand: (id: UniqueIdentifier, command: Command) => void;
    onDeleteClick?: (command: Command) => void;
    onCancleEdit?: () => void;
}

export default function CommandCard({
    command,
    isOverlay,
    editMode,
    onModifyCommand,
    onDeleteClick,
    onCancleEdit,
}: TaskCardProps) {
    const [showMore, setShowMore] = useState(editMode || false);
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState<boolean>(editMode || false);
    const [values, setValues] = useState<Command>(command);
    const [deleteAlert, setDeleteAlert] = useState(false);
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
        navigator.clipboard.writeText(command.command);
        setCopied(true);
    };

    const handleShowMore = () => {
        setShowMore((prev) => !prev);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (onCancleEdit) onCancleEdit();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValues((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSaveChange = () => {
        onModifyCommand(command.id, values);
        setIsEditing(false);
    };

    const handleDeleteClick = () => {
        setDeleteAlert(true);
    };

    const handleDeleteSuccess = () => {
        if (!onDeleteClick) return;
        onDeleteClick(command);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSaveChange();
    };

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => {
                setCopied(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [copied]);

    useEffect(() => {
        setIsEditing(editMode || false);
    }, [editMode]);

    useEffect(() => {
        setValues(command);
    }, [command, isEditing]);

    return (
        <>
            <Card
                ref={setNodeRef}
                style={style}
                className={variants({
                    dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
                })}
            >
                <form onSubmit={handleSubmit}>
                    <CardHeader
                        className={cn(
                            "p-1 text-left whitespace-pre-wrap",
                            showMore ? "border-b-2 border-secondary" : ""
                        )}
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
                            {isEditing ? (
                                <Input type="text" name="command" value={values.command} onChange={handleChange} />
                            ) : (
                                <pre className="flex-1 resize-none whitespace-pre-wrap rounded-md p-2 border break-words">
                                    <code
                                        style={{
                                            fontFamily: `"Fira Code", "Source Code Pro", "Courier New", monospace`,
                                        }}
                                    >
                                        {command.command || " "}
                                    </code>
                                </pre>
                            )}

                            <div className="flex items-center">
                                {/* Copy Button */}
                                <div className="rounded-md px-1 py-2" onClick={handleCopy}>
                                    <Button variant={"ghost"} className="p-1 text-secondary-foreground/50 -ml-2 h-auto">
                                        <span className="sr-only">Move command</span>
                                        {copied ? <CopyCheck size={20} /> : <Copy size={20} />}
                                    </Button>
                                </div>

                                {/* Action Button */}
                                <div className="rounded-md px-1 py-2" onClick={handleShowMore}>
                                    <Button variant={"ghost"} className="p-1 text-secondary-foreground/50 -ml-2 h-auto">
                                        <span className="sr-only">Move command</span>
                                        {showMore ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    {showMore && (
                        <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
                            {isEditing ? (
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    className="block p-2.5 w-full rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Write command description here"
                                    value={values.description}
                                    onChange={handleChange}
                                />
                            ) : (
                                <div>{command.description}</div>
                            )}

                            {isEditing ? (
                                <div className="flex gap-2 mt-4 justify-end">
                                    <Button variant="success" onClick={handleSaveChange}>
                                        <Check size={15} />
                                    </Button>
                                    <Button variant="destructive" onClick={handleCancelEdit}>
                                        <X size={15} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2 mt-4 justify-end">
                                    <Button variant="secondary" onClick={handleEditClick}>
                                        <Edit size={15} />
                                    </Button>
                                    <Button variant="destructive" onClick={handleDeleteClick}>
                                        <Trash size={15} />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    )}
                </form>
            </Card>
            <DeleteAlert
                open={deleteAlert}
                onOpenChange={setDeleteAlert}
                title={`Delete ${displayNames.command.singularCaps}`}
                description={`Are you sure? This ${displayNames.command.singlularSimple} will be deleted permanently.`}
                onDelete={handleDeleteSuccess}
            />
        </>
    );
}
