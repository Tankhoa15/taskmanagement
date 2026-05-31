import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Send, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { commentService } from '../services/commentService'
import { useTaskWebSocket } from '../hooks/useTaskWebSocket'
import { useAuthStore } from '../store/authStore'
import type { Comment } from '../types'
import clsx from 'clsx'

interface Props {
  taskId: string
}

export default function CommentSection({ taskId }: Props) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentService.getComments(taskId),
  })

  // Real-time: nhận comment mới từ WebSocket
  useTaskWebSocket(
    taskId,
    useCallback(
      (newComment: Comment) => {
        queryClient.setQueryData(['comments', taskId], (old: Comment[] = []) => {
          if (old.some((c) => c.id === newComment.id)) return old
          return [...old, newComment]
        })
      },
      [taskId, queryClient]
    )
  )

  // Auto-scroll xuống dưới khi có comment mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  const addComment = useMutation({
    mutationFn: () => commentService.addComment(taskId, content.trim()),
    onSuccess: (newComment) => {
      setContent('')
      // Thêm vào cache ngay (WS sẽ broadcast cho người khác)
      queryClient.setQueryData(['comments', taskId], (old: Comment[] = []) =>
        old.some((c) => c.id === newComment.id) ? old : [...old, newComment]
      )
    },
    onError: () => toast.error('Gửi comment thất bại'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) addComment.mutate()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (content.trim()) addComment.mutate()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <MessageSquare size={18} className="text-gray-500" />
        <span className="font-medium text-gray-900">
          Comments {comments.length > 0 && <span className="text-gray-400 font-normal">({comments.length})</span>}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Real-time
        </span>
      </div>

      {/* Comment list */}
      <div className="px-6 py-4 max-h-96 overflow-y-auto space-y-4">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && comments.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có comment nào. Hãy là người đầu tiên!</p>
          </div>
        )}

        {comments.map((comment) => {
          const isMine = comment.authorId === user?.id
          return (
            <div key={comment.id} className={clsx('flex gap-3', isMine && 'flex-row-reverse')}>
              {/* Avatar */}
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
                  isMine ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                )}
              >
                {(comment.authorName || comment.authorEmail).charAt(0).toUpperCase()}
              </div>

              {/* Bubble */}
              <div className={clsx('max-w-[75%]', isMine && 'items-end flex flex-col')}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={clsx('text-xs font-medium', isMine ? 'text-primary-600' : 'text-gray-700')}>
                    {isMine ? 'Bạn' : (comment.authorName || comment.authorEmail)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(comment.createdAt), 'HH:mm dd/MM', { locale: vi })}
                  </span>
                </div>
                <div
                  className={clsx(
                    'px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words',
                    isMine
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  )}
                >
                  {comment.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-100 flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập comment... (Enter để gửi, Shift+Enter xuống dòng)"
          rows={2}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!content.trim() || addComment.isPending}
          className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
