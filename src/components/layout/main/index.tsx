import { Activity } from "react";
import MainHandlerManager from "./molecules/manager";
import AppControls from "@src/components/molecules/controls";
import { useAppContext } from "@src/global/context/app";

export default function LayoutManager() {
    const { isWindowFocused } = useAppContext();
    
    return (
        <div className="w-full h-screen flex flex-col gap-1 relative">
            <Activity mode={isWindowFocused ? "visible" : "hidden"}>
                <AppControls />
            </Activity>

            <MainHandlerManager />
        </div>
    );
}
