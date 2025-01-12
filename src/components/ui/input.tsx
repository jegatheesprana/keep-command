import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Input
 *
 * Displays a form input field or a component that looks like an input field.
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
    return (
        <input
            type={type}
            ref={ref}
            spellCheck={false}
            className={cn(
                "dark:bg-surface-950",
                "rounded-md border-2 border-surface-100 focus-visible:border-surface-100 dark:border-surface-800",
                "focus-visible:ring-brand-600 dark:focus-visible:ring-brand-400",
                "flex h-10 w-full px-3 py-2 text-sm placeholder:text-surface-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-surface-50 dark:placeholder:text-surface-700 dark:focus-visible:ring-offset-surface-900",
                "autofill:shadow-fill-white autofill:text-fill-surface-950 dark:autofill:shadow-fill-surface-950 dark:autofill:text-fill-surface-50",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                className
            )}
            {...props}
        />
    );
});
Input.displayName = "Input";
