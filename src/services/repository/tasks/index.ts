import { Task } from "@src/shared/@types/task";
import Database from "@tauri-apps/plugin-sql";
import * as console from "@tauri-apps/plugin-log";

const table = {
    name: "tasks",
} as const;

/**
 * Busca todas as tarefas. OBS: não deletadas
 */
export async function getTasks(dbInstance: Database): Promise<Task[]> {
    try {
        const data: Task[] = await dbInstance.select(
            `SELECT * FROM ${table.name} WHERE deleted_at IS NULL ORDER BY is_completed ASC, created_at DESC`
        );

        return data;
    } catch (error) {
        await console.error(`[Repository:getTasks] Erro ao buscar tarefas: ${JSON.stringify(error)}`);
        return [];
    }
}

type CreateTaskArgs = {
    description: string;
    isCompleted?: boolean;
};

type CreateTaskResult = {
    lastInsertId: number;
    rowsAffected: number;
};

/**
 * Cria uma nova tarefa
 */
export async function createTask(dbInstance: Database, args: CreateTaskArgs): Promise<CreateTaskResult | null> {
    try {
        await console.debug(`[Repository:createTask] Dados: ${JSON.stringify(args)}`);
        
        const isCompleted = args?.isCompleted ? 1 : 0;
        const result = await dbInstance.execute(
            `INSERT INTO ${table.name} (description, is_completed) VALUES ($1, $2)`,
            [args.description, isCompleted]
        ) as CreateTaskResult;
        
        await console.info(
            `[Repository:createTask] Task created | ID: ${result.lastInsertId}, Linhas afetadas: ${result.rowsAffected}`
        );
        
        return result;
    } catch (error) {
        await console.error(`[Repository:createTask] Erro ao criar tarefa: ${JSON.stringify(error)}`);
        return null;
    }
}

type UpdateTaskArgs = {
    id: number;
    description?: string;
    isCompleted?: boolean;
};

/**
 * Atualiza uma tarefa existente
 */
export async function updateTask(
    dbInstance: Database,
    args: UpdateTaskArgs
): Promise<boolean> {
    try {
        await console.debug(`[Repository:updateTask] Dados: ${JSON.stringify(args)}`);
        
        const updates: string[] = [];
        const values: (string | number)[] = [];
        
        if (args.description !== undefined) {
            updates.push(`description = $${values.length + 1}`);
            values.push(args.description);
        }
        
        if (args.isCompleted !== undefined) {
            updates.push(`is_completed = $${values.length + 1}`);
            values.push(args.isCompleted ? 1 : 0);
        }
        
        if (updates.length === 0) {
            await console.warn(`[Repository:updateTask] Nenhum campo para atualizar`);
            return false;
        }
        
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        
        // Adiciona o ID como último parâmetro
        const whereParam = values.length + 1;
        values.push(args.id);
        
        const query = `UPDATE ${table.name} SET ${updates.join(", ")} WHERE id = $${whereParam}`;
        const result = await dbInstance.execute(query, values);
        
        await console.info(
            `[Repository:updateTask] Linhas afetadas: ${result.rowsAffected}`
        );
        
        if (result.rowsAffected === 0) {
            await console.warn(`[Repository:updateTask] Nenhuma linha foi atualizada. Tarefa ID ${args.id} não encontrada?`);
        }
        
        return result.rowsAffected > 0;
    } catch (error) {
        await console.error(`[Repository:updateTask] Erro: ${JSON.stringify(error)}`);
        
        if (error instanceof Error) {
            await console.error(`[Repository:updateTask] Mensagem: ${error.message}`);
        }
        
        return false;
    }
}

/**
 * Soft delete - marca a tarefa como deletada
 */
export async function deleteTask(dbInstance: Database, id: number): Promise<boolean> {
    try {
        const result = await dbInstance.execute(
            `UPDATE ${table.name} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
        );
        
        await console.info(
            `[Repository:deleteTask] Tarefa deletada! Linhas afetadas: ${result.rowsAffected}`
        );
        
        return result.rowsAffected > 0;
    } catch (error) {
        await console.error(`[Repository:deleteTask] Erro ao deletar tarefa: ${JSON.stringify(error)}`);
        return false;
    }
}

/**
 * Busca uma tarefa específica por ID
 */
export async function getTaskById(dbInstance: Database, id: number): Promise<Task | null> {
    try {
        const data: Task[] = await dbInstance.select(
            `SELECT * FROM ${table.name} WHERE id = $1 AND deleted_at IS NULL`,
            [id]
        );
        
        if (data.length === 0) {
            await console.warn(`[Repository:getTaskById] Tarefa não encontrada`);
            return null;
        }

        await console.debug(`[Repository:getTaskById] Dados: ${JSON.stringify(data[0])}`);        
        
        return data[0];
    } catch (error) {
        await console.error(`[Repository:getTaskById] Erro ao buscar tarefa: ${JSON.stringify(error)}`);
        return null;
    }
}
