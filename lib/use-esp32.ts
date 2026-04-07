'use client'

import { useEffect, useRef, useState } from 'react'

export type DeviceStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export function useEsp32(uid: string | null) {
  const [status, setStatus] = useState<DeviceStatus>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)

  const connect = (bridgeUrl: string) => {
    if (!uid || wsRef.current?.readyState === WebSocket.OPEN) return
    setStatus('connecting')
    const ws = new WebSocket(bridgeUrl)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ secret: process.env.NEXT_PUBLIC_ESP32_SECRET, uid }))
    }
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data as string)
      if (msg.status === 'connected') setStatus('connected')
      if (msg.error) setStatus('error')
    }
    ws.onclose = () => setStatus('disconnected')
    ws.onerror = () => setStatus('error')
  }

  const disconnect = () => {
    wsRef.current?.close()
    wsRef.current = null
    setStatus('disconnected')
  }

  useEffect(() => () => { wsRef.current?.close() }, [])

  return { status, connect, disconnect }
}
