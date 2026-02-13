import { NextRequest, NextResponse } from 'next/server'

const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_API_URL = 'https://api.daily.co/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomName, userName, isOwner = false } = body

    if (!roomName) {
      return NextResponse.json({ error: 'Room name required' }, { status: 400 })
    }

    // Create meeting token
    const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName || 'Guest',
          is_owner: isOwner,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          // Token expires in 1 hour
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create token')
    }

    return NextResponse.json({ 
      token: data.token,
      roomUrl: `https://${process.env.DAILY_DOMAIN}.daily.co/${roomName}`
    })
  } catch (error: any) {
    console.error('Error creating token:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create token' },
      { status: 500 }
    )
  }
}
