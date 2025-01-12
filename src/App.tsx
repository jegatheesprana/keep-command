import { useRoutes } from "react-router-dom";
import { Github } from "lucide-react";
import "./App.css";
import { ThemeToggle } from "./components/ThemeToggle";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import routes from "./router";

function App() {
    const content = useRoutes(routes);
    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <div className="min-h-screen flex flex-col">
                    <header className="flex justify-between w-full flex-row p-4 pb-6">
                        {/* <Button variant="link" asChild className="text-primary h-8 w-8 p-0">
                            <a href="https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui">
                                <Github className="fill-current h-full w-full" />
                            </a>
                        </Button> */}
                        <div />
                        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                            Keep Commands
                        </h1>
                        <ThemeToggle />
                    </header>
                    <main className="mx-4 flex flex-col gap-6">{content}</main>
                </div>
            </ThemeProvider>
        </>
    );
}

export default App;
