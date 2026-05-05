import { NextRequest, NextResponse } from 'next/server'
import { getConfig, saveConfig, Config } from '@/lib/config'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2024'

export async function GET() {
  try {
    return NextResponse.json(getConfig())
  } catch {
    return NextResponse.json({ error: 'Could not load config' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = req.headers.get('x-admin-password')
    if (auth !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body: Config = await req.json()
    saveConfig(body)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Could not save config' }, { status: 500 })
  }
}
