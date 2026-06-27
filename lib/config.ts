import fs from 'fs'
import path from 'path'

export interface PriceEntry {
  product: string
  material: string
  profile: string
  staklo: string       // "" means glass selection not applicable (doors)
  width: number        // mm
  height: number       // mm
  price: number        // €
  roletna: number      // € per entry, 0 = not available
  komarnik: number
  okapnica: number
  podprozorska: number
  rabat: number        // % added to total, hidden from user
  pdv: number          // % added to total, hidden from user
}

export interface Config {
  pricelist: PriceEntry[]
  montaza: { fixedPrice: number; enabled: boolean }
  header: { title: string; subtitle: string; disclaimer: string }
  footer: { lines: string[] }
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json')

export function getConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
}

export function saveConfig(data: Config): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8')
}
