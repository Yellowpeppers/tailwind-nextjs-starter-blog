import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const customSoundsDir = path.join(process.cwd(), 'public/static/sounds/custom')

    if (!fs.existsSync(customSoundsDir)) {
      return NextResponse.json({ sounds: [] })
    }

    const files = fs.readdirSync(customSoundsDir)
    const soundFiles = files.filter((file) => /\.(mp3|wav|ogg)$/i.test(file))

    return NextResponse.json({ sounds: soundFiles })
  } catch (error) {
    console.error('Error reading custom sounds directory:', error)
    return NextResponse.json({ error: 'Failed to fetch sounds' }, { status: 500 })
  }
}
