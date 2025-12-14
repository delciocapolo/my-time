import { useAppContext } from "@src/global/context/app";
import { ListTodoIcon } from "lucide-react";
import TaskItem from "./task-item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";

export default function TasksSection() {
    const { tasks, } = useAppContext();

    if (tasks.length <= 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-3">
                <ListTodoIcon size={26} className="text-gray-500 dark:text-gray-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Nenhuma tarefa ainda.
                </p>
            </div>
        );
    }

    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger className="flex-col gap-2 items-center pb-4 pt-0 px-3 hover:no-underline">
                    <TaskItem 
                        task={tasks[0]} 
                        className="w-full"
                        onClick={(event) => event.stopPropagation()}
                    />
                </AccordionTrigger>
                
                <AccordionContent className="pb-0">
                    <ul className="space-y-2 rounded-lg overflow-x-hidden max-h-52 custom-scroll">
                        {
                            tasks
                            .slice(1)
                            .map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))
                        }
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
