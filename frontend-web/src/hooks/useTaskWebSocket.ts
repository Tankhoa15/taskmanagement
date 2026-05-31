import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import type { Comment } from '../types'

const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080')
  .replace(/^http/, 'ws')

interface WsMessage {
  type: 'NEW_COMMENT'
  comment: Comment
}

export function useTaskWebSocket(taskId: string | undefined, onNewComment: (comment: Comment) => void) {
  const { token } = useAuthStore()
  const onNewCommentRef = useRef(onNewComment)
  onNewCommentRef.current = onNewComment

  useEffect(() => {
    if (!taskId || !token) return

    const ws = new WebSocket(`${WS_BASE}/ws/task/${taskId}`)
    let alive = true

    ws.onopen = () => {
      // keepalive ping every 25s to prevent idle timeout
      const ping = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping')
      }, 25000)
      ws.addEventListener('close', () => clearInterval(ping))
    }

    ws.onmessage = (event) => {
      if (!alive) return
      try {
        const data: WsMessage = JSON.parse(event.data)
        if (data.type === 'NEW_COMMENT') {
          onNewCommentRef.current(data.comment)
        }
      } catch {
        // ignore non-JSON (ping responses)
      }
    }

    ws.onerror = () => {
      // will trigger onclose automatically
    }

    return () => {
      alive = false
      ws.close()
    }
  }, [taskId, token])
}
