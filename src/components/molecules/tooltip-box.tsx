import { ComponentProps, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type TooltipBoxProps = Omit<ComponentProps<"button">, "title"> & {
    title: ReactNode;
};
export default function TooltipBox({ title, children, ...props }: TooltipBoxProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild {...props}>
                {children}
            </TooltipTrigger>

            <TooltipContent>
                {
                    typeof title === "string" ? 
                        <p className="text-body-18">{title}</p> :
                        title
                }
            </TooltipContent>
        </Tooltip>
    );
}
