import { useRoutes } from "react-router-dom";
import "./App.css";
import { ThemeToggle } from "./components/ThemeToggle";
import { ThemeProvider } from "./components/theme-provider";
import routes from "./router";

function App() {
    const content = useRoutes(routes);
    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <div className="container mx-auto min-h-screen flex flex-col h-screen">
                    <header className="flex justify-between w-full flex-row p-4 pb-6">
                        {/* <Button variant="link" asChild className="text-primary h-8 w-8 p-0">
                            <a href="https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui">
                                <Github className="fill-current h-full w-full" />
                            </a>
                        </Button> */}
                        <div />
                        <h4 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-4xl text-gray-600 dark:text-gray-400">
                            Keep Commands
                        </h4>
                        <ThemeToggle />
                    </header>
                    <main className="flex flex-grow mx-4 mb-4 flex-col gap-6">{content}</main>
                </div>
            </ThemeProvider>
        </>
    );
}

export default App;
