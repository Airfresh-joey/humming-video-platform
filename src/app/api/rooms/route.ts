import { NextRequest, NextResponse } from 'next/server'

const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_API_URL = 'https://api.daily.co/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const roomName = body.name || `room-${Date.now()}`

    // Create room on Daily.co
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          max_participants: 20,
          // Room expires in 1 hour (for demo purposes)
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      }),
    })

    const data = await response.json()
    console.log('Daily API response:', JSON.stringify(data))

    if (!response.ok) {
      // Room might already exist, try to get it
      if (data.error === 'invalid-request-error' && data.info?.includes('already exists')) {
        const getResponse = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
          headers: {
            'Authorization': `Bearer ${DAILY_API_KEY}`,
          },
        })
        const existingRoom = await getResponse.json()
        return NextResponse.json(existingRoom)
      }
      throw new Error(data.info || data.error || 'Failed to create room')
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create room' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomName = searchParams.get('name')

  if (!roomName) {
    return NextResponse.json({ error: 'Room name required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get room' },
      { status: 500 }
    )
  }
}
