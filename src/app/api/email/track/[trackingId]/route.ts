import { NextRequest, NextResponse } from 'next/server'
import { trackEmailOpen } from '@/lib/email'

// GET /api/email/track/[trackingId] - Tracking pixel för e-post öppningar
export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params

    // Logga e-post öppning
    await trackEmailOpen(trackingId)

    // Returnera en transparent 1x1 pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pixel.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error tracking email:', error)
    
    // Returnera transparent pixel även vid fel för att inte förstöra e-post
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/png',
      },
    })
  }
}
