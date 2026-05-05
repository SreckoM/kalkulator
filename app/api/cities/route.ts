import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'cities.json'), 'utf-8')
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({ error: 'Could not load cities' }, { status: 500 })
  }
}
