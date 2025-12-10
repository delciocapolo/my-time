import { zodResolver } from "@hookform/resolvers/zod";
import { formCreateTaskSchema, FormCreateTaskSchemaType } from "@src/components/molecules/controls/schema";
import { Field } from "@src/components/ui/field";
import { Textarea } from "@src/components/ui/textarea";
import { useAppContext } from "@src/global/context/app";
import { createTask, getTasks } from "@src/services/repository/tasks";
import { Controller, useForm } from "react-hook-form";
import * as console from "@tauri-apps/plugin-log";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";

export default function CreateTaskWindow() {
    const { openCreateTaskWindow, setOpenCreateTaskWindow, dbConnection, setTasks } = useAppContext();
    const form = useForm<FormCreateTaskSchemaType>({
        resolver: zodResolver(formCreateTaskSchema),
        defaultValues: { description: "" },
        mode: "onSubmit",
    });

    async function onSubmitForm(data: FormCreateTaskSchemaType) {
        await console.info(`[CreateTask] Dados do formulário: ${JSON.stringify(data)}`);
        
        if (!dbConnection) {
            await console.error("[CreateTask] Database connection not established");
            return;
        }

        try {
            const result = await createTask(dbConnection, { description: data.description });
            await console.info(`[CreateTask] Resultado completo: ${JSON.stringify(result)}`);
            const taskList = await getTasks(dbConnection);
            
            setTasks(taskList);
            onCancel();
        } catch (error) {
            await console.error(`[CreateTask] Erro ao criar tarefa: ${error}`);
        }
    }

    function onCancel() {
        form.reset();
        setOpenCreateTaskWindow(false);
    }

    return (
        <AlertDialog open={openCreateTaskWindow}>
            <AlertDialogContent className="w-3/4 sm:max-w-sm border-gray-300 dark:border-gray-600/75">
                <form id="form-create-task" onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-3">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-start">Criar Tarefa</AlertDialogTitle>
                        <AlertDialogDescription>
                                <Controller 
                                    name="description"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="py-3 w-full overflow-hidden">
                                            <Textarea
                                                {...field}
                                                rows={2}
                                                id="form-description"
                                                placeholder="Descrição"
                                                aria-invalid={fieldState.invalid}
                                                className="max-w-full min-h-0 resize-none bg-white dark:bg-gray-700 border-gray-300/85 focus-visible:ring-0 box-border w-full dark:border-gray-600/75"
                                            />
                                        </Field>
                                    )}
                                />
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            type="button" 
                            onClick={onCancel} 
                            className="
                                py-0.5
                                border-gray-300 hover:text-white
                                hover:bg-error-600 dark:ring-gray-600/75
                            "
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction type="submit" form="form-create-task" className="py-0.5 text-white">Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
