'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import DailyIframe from '@daily-co/daily-js'

interface CallState {
  status: 'idle' | 'joining' | 'joined' | 'leaving' | 'error'
  error?: string
}

function RoomContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const userName = searchParams.get('name') || 'Guest'
  
  const [callState, setCallState] = useState<CallState>({ status: 'idle' })
  const [callFrame, setCallFrame] = useState<any>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [participantCount, setParticipantCount] = useState(1)

  const joinCall = useCallback(async () => {
    setCallState({ status: 'joining' })

    try {
      // First create/get the room
      const roomRes = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomId }),
      })
      const roomData = await roomRes.json()
      console.log('Room response:', roomData)

      if (roomData.error && !roomData.url && !roomData.name) {
        throw new Error(roomData.error)
      }

      // Get a token
      const tokenRes = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomName: roomId, 
          userName: userName 
        }),
      })
      const tokenData = await tokenRes.json()
      console.log('Token response:', tokenData)

      if (tokenData.error) {
        throw new Error(tokenData.error)
      }

      if (!tokenData.token) {
        throw new Error('Failed to get meeting token')
      }

      // Create the Daily call frame
      const container = document.getElementById('call-container')
      if (!container) throw new Error('Container not found')

      // Clear any existing content
      container.innerHTML = ''

      console.log('Creating Daily frame...')
      const frame = DailyIframe.createFrame(container, {
        showLeaveButton: false,
        showFullscreenButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '12px',
        },
        theme: {
          colors: {
            accent: '#4f46e5',
            accentText: '#ffffff',
            background: '#1e1e1e',
            backgroundAccent: '#2e2e2e',
            baseText: '#ffffff',
            border: '#3e3e3e',
            mainAreaBg: '#0a0a0a',
            mainAreaBgAccent: '#1a1a1a',
            mainAreaText: '#ffffff',
            supportiveText: '#aaaaaa',
          },
        },
      })

      // Set up event listeners
      frame.on('joined-meeting', () => {
        console.log('Joined meeting!')
        setCallState({ status: 'joined' })
      })

      frame.on('left-meeting', () => {
        console.log('Left meeting')
        setCallState({ status: 'idle' })
      })

      frame.on('error', (event: any) => {
        console.error('Daily error:', event)
        setCallState({ status: 'error', error: event.errorMsg || 'Connection error' })
      })

      frame.on('participant-counts-updated', (event: any) => {
        setParticipantCount(event.participantCounts.present)
      })

      frame.on('loading', () => {
        console.log('Daily: loading...')
      })

      frame.on('loaded', () => {
        console.log('Daily: loaded!')
      })

      // Join the room
      console.log('Joining room:', tokenData.roomUrl, 'with token')
      const joinResult = await frame.join({
        url: tokenData.roomUrl,
        token: tokenData.token,
        userName: userName,
      })
      console.log('Join result:', joinResult)

      setCallFrame(frame)
    } catch (error: any) {
      console.error('Failed to join call:', error)
      setCallState({ status: 'error', error: error.message })
    }
  }, [roomId, userName])

  const leaveCall = useCallback(async () => {
    if (callFrame) {
      setCallState({ status: 'leaving' })
      await callFrame.leave()
      callFrame.destroy()
      setCallFrame(null)
      setCallState({ status: 'idle' })
    }
  }, [callFrame])

  const toggleMute = useCallback(() => {
    if (callFrame) {
      const newMuted = !isMuted
      callFrame.setLocalAudio(!newMuted)
      setIsMuted(newMuted)
    }
  }, [callFrame, isMuted])

  const toggleVideo = useCallback(() => {
    if (callFrame) {
      const newVideoOff = !isVideoOff
      callFrame.setLocalVideo(!newVideoOff)
      setIsVideoOff(newVideoOff)
    }
  }, [callFrame, isVideoOff])

  const toggleScreenShare = useCallback(async () => {
    if (callFrame) {
      if (isScreenSharing) {
        await callFrame.stopScreenShare()
      } else {
        await callFrame.startScreenShare()
      }
      setIsScreenSharing(!isScreenSharing)
    }
  }, [callFrame, isScreenSharing])

  const copyInviteLink = useCallback(() => {
    const link = window.location.href
    navigator.clipboard.writeText(link)
    alert('Invite link copied!')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callFrame) {
        callFrame.destroy()
      }
    }
  }, [callFrame])

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/humming-logo.png" alt="Humming Agent AI" className="h-10 w-auto" />
          <h1 className="text-white font-semibold">Meeting: {roomId}</h1>
          <span className="text-slate-400 text-sm">
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={copyInviteLink}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          Copy Invite Link
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 flex flex-col">
        {callState.status === 'idle' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to join?
              </h2>
              <p className="text-slate-400 mb-6">
                Joining as: <span className="text-indigo-400">{userName}</span>
              </p>
              <button
                onClick={joinCall}
                className="px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
              >
                Join Meeting
              </button>
            </div>
          </div>
        )}

        {callState.status === 'joining' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Container for Daily frame - must be visible for frame creation */}
            <div
              id="call-container"
              className="flex-1 rounded-xl overflow-hidden bg-black"
              style={{ minHeight: 'calc(100vh - 150px)' }}
            >
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white">Joining meeting...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {callState.status === 'error' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-red-400 mb-4 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="font-medium mb-2">Unable to join meeting</p>
                <p className="text-sm">{callState.error}</p>
              </div>
              <button
                onClick={joinCall}
                className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {(callState.status === 'joined' || callState.status === 'leaving') && (
          <>
            {/* Video Container */}
            <div
              id="call-container"
              className="flex-1 rounded-xl overflow-hidden bg-black"
              style={{ minHeight: 'calc(100vh - 150px)' }}
            ></div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  isVideoOff
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isVideoOff ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M3 3l18 18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-full transition-colors ${
                  isScreenSharing
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>

              <button
                onClick={leaveCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                title="Leave meeting"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Hidden container for video when idle */}
        {callState.status === 'idle' && (
          <div id="call-container" className="hidden"></div>
        )}
      </div>
    </main>
  )
}

export default function RoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <RoomContent />
    </Suspense>
  )
}
