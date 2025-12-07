import { useAppContext } from "@src/global/context/app";
import ClockFocusesComponent from "./molecules/handle-clock-focuses";
import ClockStateComponent from "./molecules/handle-clock-state";
import CreateTaskComponent from "./molecules/handle-create-task";
import { Activity } from "react";

export default function AppControls() {
    const { mode } = useAppContext();
    
    return (
        <div className="relative h-10">
            <div className="absolute inset-0 top-0 left-0 z-50 flex-center">
                <div 
                    className="
                        flex-center rounded-md 
                        bg-background border border-gray-300 
                        dark:border-gray-600
                    "
                >
                    <ClockStateComponent />
                    
                    <hr className="h-8 border border-gray-300 dark:border-gray-600/45 mx-0.5" />
                    <ClockFocusesComponent />
                    
                    <Activity mode={mode === "pomodoro" ? "visible" : "hidden"}>
                        <hr className="h-8 border border-gray-300 dark:border-gray-600/45 mx-0.5" />
                        <CreateTaskComponent />
                    </Activity>
                </div>
            </div>
        </div>
    );
}
