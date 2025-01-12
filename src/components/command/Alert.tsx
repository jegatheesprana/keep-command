type AlertProps = {
    title: string;
    message: string;
    children?: React.ReactNode;
};

export default function Alert({ title, message, children }: AlertProps) {
    return (
        <div className="flex flex-col justify-center h-full container mx-auto">
            <div
                className="p-4 text-sm text-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border-b-2 border-secondary"
                role="alert"
            >
                {children ? (
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <span className="font-medium">{title}</span> {message}
                        </div>
                        {<div>{children}</div>}
                    </div>
                ) : (
                    <>
                        <span className="font-medium">{title}</span> {message}
                    </>
                )}
            </div>
        </div>
    );
}
