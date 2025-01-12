import { MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ActionProps = {
    onEditClick: () => void;
    onDeleteClick: () => void;
};

export default function Action({ onEditClick, onDeleteClick }: ActionProps) {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} size="icon" className="p-1 text-secondary-foreground/50 -ml-2 h-auto">
                        <MoreVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEditClick}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={onDeleteClick}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
