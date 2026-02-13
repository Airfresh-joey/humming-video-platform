'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const [roomName, setRoomName] = useState('')
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Sanitize room name - only allow alphanumeric, dash, underscore
  const sanitizeRoomName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-')
  }

  const handleCreateRoom = async () => {
    setError('')
    setLoading(true)
    
    // Generate random room name if empty
    const rawRoom = roomName || `meeting-${Date.now()}`
    const room = sanitizeRoomName(rawRoom)
    
    try {
      // Create the room via API
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: room }),
      })
      
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }
      if (data.url || data.name) {
        router.push(`/room/${room}?name=${encodeURIComponent(userName || 'Guest')}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create room')
      setLoading(false)
    }
  }

  const handleJoinRoom = () => {
    if (roomName) {
      const room = sanitizeRoomName(roomName)
      router.push(`/room/${room}?name=${encodeURIComponent(userName || 'Guest')}`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/humming-logo.png" alt="Humming Agent AI" className="h-20 w-auto" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Humming Agent AI
            </h1>
          </div>
          <p className="text-xl text-slate-300">
            Video Conferencing for Teams
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* User Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Room Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Meeting Room
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name or leave blank"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create New Meeting'}
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={!roomName}
                className="w-full py-3 px-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Existing Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">HD Video</h3>
            <p className="text-slate-400">Crystal clear video quality up to 1080p</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">In-Call Chat</h3>
            <p className="text-slate-400">Message participants during calls</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Screen Share</h3>
            <p className="text-slate-400">Share your screen with one click</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          Powered by Humming Agent AI
        </div>
      </div>
    </main>
  )
}
