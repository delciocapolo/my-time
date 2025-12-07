import { z } from "zod";

export const formCreateTaskSchema = z.object({
    description: z
        .string()
        .min(1, "A descrição não pode estar vazia")
        .max(200, "A descrição não pode ter mais de 200 caracteres")
        .trim()
});

export type FormCreateTaskSchemaType = z.infer<typeof formCreateTaskSchema>;