import { SCHEDULER_TASKS, SchedulerTaskReport } from '@commonTypes'

export async function safeExecTask(
  taskName: (typeof SCHEDULER_TASKS)[keyof typeof SCHEDULER_TASKS],
  taskFunc: () => Promise<any>,
  report: SchedulerTaskReport[]
) {
  try {
    await taskFunc()
    report.push({
      task: taskName,
      status: 'success',
      message: `${taskName} completed successfully.`
    })
  } catch (error: Error | any) {
    report.push({ task: taskName, status: 'error', message: error?.message })
  }
}
