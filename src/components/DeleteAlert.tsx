import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

type DeleteAlertProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onDelete: () => void;
};

export default function DeleteAlert({ open, onOpenChange, title, description, onDelete }: DeleteAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>

                <div className="flex gap-1 mt-4 justify-end">
                    <AlertDialogCancel asChild>
                        <div>
                            <Button variant="secondary">Cancel</Button>
                        </div>
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} asChild>
                        <div>
                            <Button variant="destructive">Delete</Button>
                        </div>
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
