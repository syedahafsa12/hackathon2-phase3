import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";
import type { Task, TaskListResponse } from "@/lib/types";

interface TaskFilters {
  completed?: boolean;
  priority?: "high" | "medium" | "low";
  category?: string;
  search?: string;
  tag_ids?: number[];
  sort_by?: "created_at" | "due_date" | "priority" | "title";
  sort_order?: "asc" | "desc";
  skip?: number;
  limit?: number;
}

interface CreateTaskData {
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  category?: string;
  due_date?: string;
  estimated_minutes?: number;
  tag_ids?: number[];
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "high" | "medium" | "low";
  category?: string;
  due_date?: string;
  estimated_minutes?: number;
  tag_ids?: number[];
}

export function useTasks(filters: TaskFilters = {}) {
  const queryClient = useQueryClient();

  // Build query params
  const params = new URLSearchParams();
  if (filters.completed !== undefined)
    params.append("completed", String(filters.completed));
  if (filters.priority) params.append("priority", filters.priority);
  if (filters.category) params.append("category", filters.category);
  if (filters.search) params.append("search", filters.search);
  if (filters.tag_ids?.length) {
    filters.tag_ids.forEach((id) => params.append("tag_ids", String(id)));
  }
  if (filters.sort_by) params.append("sort_by", filters.sort_by);
  if (filters.sort_order) params.append("sort_order", filters.sort_order);
  if (filters.skip !== undefined) params.append("skip", String(filters.skip));
  if (filters.limit !== undefined)
    params.append("limit", String(filters.limit));

  // Get tasks with filters
  const tasksQuery = useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const response = await api.get<TaskListResponse>(
        `/tasks/?${params.toString()}`
      );
      return response.data;
    },
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const response = await api.post<Task>("/tasks/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully!");
    },
    onError: (error: any) => {
      let message = error.response?.data?.detail || "Failed to create task";
      if (typeof message !== "string") message = JSON.stringify(message);
      toast.error(message);
    },
  });

  // Update task mutation
  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTaskData }) => {
      const response = await api.patch<Task>(`/tasks/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully!");
    },
    onError: (error: any) => {
      let message = error.response?.data?.detail || "Failed to update task";
      if (typeof message !== "string") message = JSON.stringify(message);
      toast.error(message);
    },
  });

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tasks/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully!");
    },
    onError: (error: any) => {
      let message = error.response?.data?.detail || "Failed to delete task";
      if (typeof message !== "string") message = JSON.stringify(message);
      toast.error(message);
    },
  });

  // Bulk delete mutation
  const bulkDeleteTasks = useMutation({
    mutationFn: async (taskIds: number[]) => {
      await api.post("/tasks/bulk-delete/", taskIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tasks deleted successfully!");
    },
    onError: (error: any) => {
      let message = error.response?.data?.detail || "Failed to delete tasks";
      if (typeof message !== "string") message = JSON.stringify(message);
      toast.error(message);
    },
  });

  // Bulk update mutation
  const bulkUpdateTasks = useMutation({
    mutationFn: async ({
      taskIds,
      data,
    }: {
      taskIds: number[];
      data: UpdateTaskData;
    }) => {
      // Build query string with multiple task_ids
      const params = new URLSearchParams();
      taskIds.forEach(id => params.append('task_ids', String(id)));
      const response = await api.patch<Task[]>(`/tasks/bulk-update/?${params.toString()}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tasks updated successfully!");
    },
    onError: (error: any) => {
      let message = error.response?.data?.detail || "Failed to update tasks";
      if (typeof message !== "string") message = JSON.stringify(message);
      toast.error(message);
    },
  });

  // Toggle task completion (optimistic update)
  const toggleTaskCompletion = useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: number;
      completed: boolean;
    }) => {
      const response = await api.patch<Task>(`/tasks/${id}`, { completed });
      return response.data;
    },
    onMutate: async ({ id, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(["tasks", filters]);

      // Optimistically update
      queryClient.setQueryData(["tasks", filters], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((task: Task) =>
            task.id === id ? { ...task, completed } : task
          ),
          completed: completed ? old.completed + 1 : old.completed - 1,
          pending: completed ? old.pending - 1 : old.pending + 1,
        };
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", filters], context.previousTasks);
      }
      toast.error("Failed to update task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks: tasksQuery.data?.tasks || [],
    total: tasksQuery.data?.total || 0,
    completed: tasksQuery.data?.completed || 0,
    pending: tasksQuery.data?.pending || 0,
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask,
    updateTask,
    deleteTask,
    bulkDeleteTasks,
    bulkUpdateTasks,
    toggleTaskCompletion,
  };
}
