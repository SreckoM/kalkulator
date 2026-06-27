import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { getConfig, saveConfig } from '@/lib/config'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2024'

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('x-admin-password')
    if (auth !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const ws = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as unknown[][]

    if (rows.length < 2) {
      return NextResponse.json({ error: 'Excel file is empty or has no data rows' }, { status: 400 })
    }

    const pricelist = []
    for (const row of rows.slice(1)) {
      const [dims, price, roletna, komarnik, okapnica, podprozorska, profile, product, staklo, material, rabat, pdv] = row as [string, number, number, number, number, number, string, string, string | number, string, number, number]

      if (!dims || !product || !material) continue

      const parts = String(dims).trim().split(/[Xx]/)
      if (parts.length !== 2) continue
      const width = parseInt(parts[0])
      const height = parseInt(parts[1])
      if (isNaN(width) || isNaN(height)) continue

      pricelist.push({
        product: String(product),
        material: String(material),
        profile: String(profile),
        staklo: staklo && staklo !== 0 ? String(staklo) : '',
        width,
        height,
        price: Math.round(Number(price) * 100) / 100,
        roletna: roletna && roletna !== 0 ? Math.round(Number(roletna) * 100) / 100 : 0,
        komarnik: komarnik && komarnik !== 0 ? Math.round(Number(komarnik) * 100) / 100 : 0,
        okapnica: okapnica && okapnica !== 0 ? Math.round(Number(okapnica) * 100) / 100 : 0,
        podprozorska: podprozorska && podprozorska !== 0 ? Math.round(Number(podprozorska) * 100) / 100 : 0,
        rabat: rabat ? Number(rabat) : 0,
        pdv: pdv ? Number(pdv) : 0,
      })
    }

    if (pricelist.length === 0) {
      return NextResponse.json({ error: 'No valid rows found in Excel file' }, { status: 400 })
    }

    const existing = getConfig()
    saveConfig({ ...existing, pricelist })

    return NextResponse.json({ success: true, count: pricelist.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to parse Excel file' }, { status: 500 })
  }
}
