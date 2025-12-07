import TooltipBox from "../../../tooltip-box";
import { CircleCheckBigIcon } from "lucide-react";
import { Button } from "@src/components/ui/button";
import { useAppContext } from "@src/global/context/app";
import { Fragment } from "react/jsx-runtime";

export default function CreateTaskComponent() {
    const { setOpenCreateTaskWindow, openCreateTaskWindow } = useAppContext();
    return (
        <Fragment>
            {/* <TooltipBox title="Adicionar Tarefa"> */}
                <Button 
                    size={"icon-sm"} 
                    variant={"default"} 
                    className="border-gray-300 dark:border-gray-600 bg-background dark:bg-background text-foreground rounded-none rounded-r-sm hover:bg-gray-500/15"
                    onClick={() => setOpenCreateTaskWindow(!openCreateTaskWindow)}
                >
                    <CircleCheckBigIcon />
                </Button>
            {/* </TooltipBox> */}
        </Fragment>
    );
}
