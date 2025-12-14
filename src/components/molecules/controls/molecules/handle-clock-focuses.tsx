import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { useAppContext } from "@src/global/context/app";
import { AppMode } from "@src/global/context/app/types";
import { useClockHandlerContext } from "@src/global/context/clock-handler";
import { cn } from "@src/utils";

const items = [
    { id: "pomodoro", label: "Pomodoro" },
    { id: "focus", label: "Foco" },
    { id: "pause", label: "Pausa" },
];

export default function ClockFocusesComponent() {
    const { setMode, mode, } = useAppContext();
    const { setIsRunningCycle, } = useClockHandlerContext();

    // handlers
    const onChandeMode = (value: AppMode) => {
        setIsRunningCycle(false);
        setTimeout(() => {
            setMode(value);
        }, 100);
    }

    return (
        <Select value={mode} onValueChange={onChandeMode}>
            <SelectTrigger 
                className={cn("py-0 data-[size=default]:h-8 border-none dark:bg-background text-foreground focus-visible:ring-gray-600 dark:hover:bg-gray-500/15", mode !== "pomodoro" ? "rounded-none rounded-r-sm" : "rounded-none")}
            >
                <SelectValue placeholder="Modo" />
            </SelectTrigger>
            <SelectContent 
                className="bg-background text-foreground border-gray-300 dark:border-gray-600"
                position="popper"
                side="bottom"
                align="center"
            >
                {
                    items.map((item, index) => (
                        <SelectItem key={index} className="w-20 hover:text-background!" value={item.id}>{item.label}</SelectItem>
                    ))
                }
            </SelectContent>
        </Select>
    );
}
