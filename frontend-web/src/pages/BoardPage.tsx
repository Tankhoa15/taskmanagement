import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { taskService } from '../services/taskService'
import LabelBadge from '../components/LabelBadge'
import toast from 'react-hot-toast'
import { Plus, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import clsx from 'clsx'
import type { Task, TaskStatus } from '../types'

const COLUMNS: { status: TaskStatus; label: string; color: string; bg: string }[] = [
  { status: 'OPEN',    label: 'Mới',        color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  { status: 'PENDING', label: 'Chờ',        color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  { status: 'PROCESS', label: 'Đang xử lý', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  { status: 'DONE',    label: 'Hoàn thành', color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  { status: 'CANCEL',  label: 'Hủy',        color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200' },
]

const priorityDot: Record<string, string> = {
  LOW: 'bg-gray-400', MEDIUM: 'bg-blue-500', HIGH: 'bg-orange-500', URGENT: 'bg-red-500',
}

// ── Droppable column ──────────────────────────────────────────────────────────
function Column({ status, label, color, bg, tasks, activeId }: {
  status: TaskStatus; label: string; color: string; bg: string
  tasks: Task[]; activeId: string | null
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className={clsx('flex flex-col rounded-xl border min-w-[260px] w-[260px] flex-shrink-0', bg, isOver && 'ring-2 ring-primary-400')}>
      <div className="px-4 py-3 flex items-center justify-between border-b border-inherit">
        <span className={clsx('font-semibold text-sm', color)}>{label}</span>
        <span className="text-xs text-gray-400 bg-white/60 rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="flex-1 p-3 space-y-2 min-h-[120px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} isDragging={task.id === activeId} />
        ))}
      </div>
    </div>
  )
}

// ── Draggable task card ───────────────────────────────────────────────────────
function TaskCard({ task, isDragging, ghost = false }: { task: Task; isDragging?: boolean; ghost?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const card = (
    <div
      className={clsx(
        'bg-white rounded-lg border border-gray-200 p-3 shadow-sm space-y-2 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40',
        ghost && 'rotate-1 shadow-xl opacity-95',
      )}
    >
      <div className="flex items-start gap-2">
        <span className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', priorityDot[task.priority])} />
        <Link
          to={`/tasks/${task.id}`}
          className="text-sm font-medium text-gray-900 hover:text-primary-600 leading-snug line-clamp-2 flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          {task.title}
        </Link>
      </div>

      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((l) => <LabelBadge key={l.id} label={l} size="sm" />)}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <User size={11} />
          {task.assigneeName || task.assigneeEmail}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {format(new Date(task.endTime), 'dd/MM', { locale: vi })}
        </span>
      </div>
    </div>
  )

  if (ghost) return card

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {card}
    </div>
  )
}

// ── Board page ─────────────────────────────────────────────────────────────────
export default function BoardPage() {
  const queryClient = useQueryClient()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [filterLabel, setFilterLabel] = useState<string>('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', 'my'],
    queryFn: taskService.getMyTasks,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.updateTaskStatus(id, { status }),
    onError: () => {
      toast.error('Không thể cập nhật trạng thái')
      queryClient.invalidateQueries({ queryKey: ['tasks', 'my'] })
    },
  })

  const allLabels = [...new Map(
    tasks.flatMap((t) => t.labels ?? []).map((l) => [l.id, l])
  ).values()]

  const filtered = filterLabel
    ? tasks.filter((t) => t.labels?.some((l) => l.id === filterLabel))
    : tasks

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over || active.id === over.id) return

    const newStatus = over.id as TaskStatus
    const task = tasks.find((t) => t.id === active.id)
    if (!task || task.status === newStatus) return

    // Optimistic update
    queryClient.setQueryData(['tasks', 'my'], (old: Task[] = []) =>
      old.map((t) => t.id === task.id ? { ...t, status: newStatus } : t)
    )

    statusMutation.mutate({ id: task.id, status: newStatus })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Board</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kéo thả task để cập nhật trạng thái</p>
        </div>
        <div className="flex items-center gap-3">
          {allLabels.length > 0 && (
            <select
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả label</option>
              {allLabels.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          )}
          <Link
            to="/tasks/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
          >
            <Plus size={16} />
            Tạo task
          </Link>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <Column
              key={col.status}
              {...col}
              tasks={filtered.filter((t) => t.status === col.status)}
              activeId={activeTask?.id ?? null}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask && <TaskCard task={activeTask} ghost />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
