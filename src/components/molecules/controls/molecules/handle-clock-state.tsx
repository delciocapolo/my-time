import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { useAppContext } from "@src/global/context/app";

export default function ClockStateComponent() {
    const { clockState, setClockState } = useAppContext();
    const items = [
        { id: "start", label: "Começar" },
        { id: "stop", label: "Parar" },
        { id: "refresh", label: "Reiniciar" },
    ];

    return (
        <Select value={clockState} onValueChange={setClockState}>
            <SelectTrigger 
                className="
                    py-0 rounded-none rounded-l-sm @max-xs:rounded-[4px_4px_0_0]
                    border-none dark:bg-background text-foreground
                    focus-visible:ring-gray-600
                    dark:hover:bg-gray-500/15
                "
            >
                <SelectValue placeholder="Estado" />
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
