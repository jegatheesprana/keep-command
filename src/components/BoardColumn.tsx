import { useDndContext } from "@dnd-kit/core";
import { cva } from "class-variance-authority";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

export default function BoardContainer({ children, className }: { children: React.ReactNode; className?: string }) {
    const dndContext = useDndContext();

    const variations = cva("h-full px-2 md:px-0 flex lg:justify-center pb-4", {
        variants: {
            dragging: {
                default: "snap-x snap-mandatory",
                active: "snap-none",
            },
        },
    });

    return (
        <ScrollArea
            className={variations({
                dragging: dndContext.active ? "active" : "default",
            })}
        >
            <div className={cn("h-full flex gap-4 items-center flex-row justify-center", className || "")}>
                {children}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
