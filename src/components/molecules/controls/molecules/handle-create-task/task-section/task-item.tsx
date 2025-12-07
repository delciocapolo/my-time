import { Task } from "@src/shared/@types/task";
import { CheckIcon, TrashIcon } from "lucide-react";
import { Button } from "@src/components/ui/button";
import { Activity, ComponentProps } from "react";
import { cn } from "@src/utils";
import { deleteTask, getTasks, updateTask } from "@src/services/repository/tasks";
import { useAppContext } from "@src/global/context/app";
import * as console from "@tauri-apps/plugin-log";

interface TaskItemProps extends ComponentProps<"div"> {
    task: Task;
}

export default function TaskItem({ task, className, ...props }: TaskItemProps) {
    const { dbConnection, setTasks } = useAppContext();

    const onToggle = async () => {
        try {
            const db = dbConnection!;
            await updateTask(db, { isCompleted: !task.is_completed, id: task.id });
            setTasks(await getTasks(db));
        } catch (error) {
            await console.error(JSON.stringify(error));
        }
    }

    const onDelete = async () => {
        try {
            const db = dbConnection!;
            await deleteTask(db, task.id);
            setTasks(await getTasks(db));
        } catch (error) {
            await console.error(JSON.stringify(error));
        }
    }

    return (
        <div 
            className={cn(
                `
                    group flex items-center gap-3 p-3 rounded-lg border
                    ${task.is_completed 
                        ? 'bg-gray-50 dark:bg-gray-800/35 border-gray-200 dark:border-gray-600/75' 
                        : 'bg-white dark:bg-gray-800/45 border-gray-200 dark:border-gray-600/75 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                    transition-all duration-200
                `, className)
            }
            {...props}
        >
            {/* Checkbox */}
            <button
                onClick={onToggle}
                className={`
                    shrink-0 size-5 rounded border-2 flex items-center justify-center
                    transition-all duration-200
                    ${task.is_completed
                        ? 'bg-primary border-primary'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary'
                    }
                `}
            >
                <Activity mode={task.is_completed ? "visible" : "hidden"}>
                    <CheckIcon className="size-3 text-white" strokeWidth={3} />
                </Activity>
            </button>

            {/* Descrição */}
            <p 
                className={`
                    flex-1 text-body-14
                    ${task.is_completed
                        ? 'line-through text-gray-400 dark:text-gray-600' 
                        : 'text-gray-700 dark:text-gray-300'
                    }
                `}
            >
                {task.description}
            </p>

            {/* Botão Deletar */}
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity size-7 text-gray-400 hover:text-error dark:hover:bg-gray-700"
            >
                <TrashIcon className="h-4 w-4" />
            </Button>
        </div>
    );
}
