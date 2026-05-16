import fs from 'fs'
import path from 'path'

export interface Product { id: string; name: string; factor: number }
export interface Type { id: string; name: string; factor: number; products: string[] }
export interface Material { id: string; name: string; pricePerCm2: number; products: string[] }
export interface Profile { id: string; name: string; factor: number; material: string; image: string }
export interface Addition { name: string; pricePerCm2?: number; pricePerCm?: number; fixedPrice?: number; enabled: boolean }
export interface Config {
  products: Product[]
  types: Type[]
  materials: Material[]
  profiles: Profile[]
  additions: { komarnik: Addition; roletna: Addition; okapnica: Addition; podprozorska: Addition; montaza: Addition }
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json')

export function getConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
}

export function saveConfig(data: Config): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8')
}
