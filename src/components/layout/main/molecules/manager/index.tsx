import { useAppContext } from "@src/global/context/app";
import CreateTaskWindow from "./create-task-window";
import TitleBar from "@src/components/molecules/title-style-bar";
import App from "@src/app";

export default function MainHandlerManager() {
    const { openCreateTaskWindow } = useAppContext();

    if (openCreateTaskWindow) {
        return <CreateTaskWindow />
    }

    return (
        <div className="flex-1 flex flex-col bg-background rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600/45">
            <TitleBar />
            
            <div className="flex-1 px-7 pb-7 pt-0.5 overflow-auto scrollbar-hidden">
                <App />
            </div>
        </div>
    )
}
