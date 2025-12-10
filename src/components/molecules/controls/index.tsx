import { Activity } from "react";
import { useAppContext } from "@src/global/context/app";
import ClockFocusesComponent from "./molecules/handle-clock-focuses";
import ClockStateComponent from "./molecules/handle-clock-state";
import CreateTaskComponent from "./molecules/handle-create-task";
import { useMediaQuery } from "react-responsive";

export default function AppControls() {
    const { mode } = useAppContext();
    const isXS = useMediaQuery({ query: "(max-width: 320px)" });
    
    return (
        <div className="relative h-10">
            <div className="absolute inset-0 top-0 left-0 z-50 flex-center">
                <div 
                    className="
                        flex-center rounded-md @max-xs:flex-col
                        bg-background border border-gray-300 
                        dark:border-gray-600
                    "
                >
                    <ClockStateComponent />
                    <Activity mode={isXS ? "hidden" : "visible"}>
                        <hr className="h-8 border border-gray-300 dark:border-gray-600/45 mx-0.5" />
                    </Activity>

                    <ClockFocusesComponent />
                    
                    <Activity mode={mode === "pomodoro" ? "visible" : "hidden"}>
                        <Activity mode={isXS ? "hidden" : "visible"}>
                            <hr className="h-8 border border-gray-300 dark:border-gray-600/45 mx-0.5" />
                        </Activity>

                        <CreateTaskComponent />
                    </Activity>
                </div>
            </div>
        </div>
    );
}
