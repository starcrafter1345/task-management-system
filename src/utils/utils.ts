export const getTaskStatus = (dueDate: Date | null, completed: boolean) => {
  if (completed) return "completed";
  if (!dueDate) return "no_date";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDate = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate(),
  );

  if (taskDate < today) return "overdue";
  if (taskDate.getTime() === today.getTime()) return "today";
  if (taskDate.getTime() === tomorrow.getTime()) return "tomorrow";
  return "upcoming";
};
