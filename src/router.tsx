import { RouteObject } from "react-router";
import KanbanBoard from "./components/KanbanBoard";

export const routes: RouteObject[] = [
    {
        path: "",
        element: <KanbanBoard />,
    },
    {
        path: "/:categoryId",
        element: <KanbanBoard />,
    },
];

export default routes;
