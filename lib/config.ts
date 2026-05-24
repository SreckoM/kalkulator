import fs from 'fs'
import path from 'path'

export interface Product { id: string; name: string }
export interface Type { id: string; name: string; products: string[] }
export interface Material { id: string; name: string; products: string[] }
export interface Profile { id: string; name: string; perimFactor: number; material: string; image: string }
export interface Surcharge { minH: number; amount: number }
export interface Formula {
  product: string
  type: string
  material: string
  areaCoeff: number
  perimCoeff: number
  constant: number
  surcharges?: Surcharge[]
}
export interface Addition { name: string; pricePerCm2?: number; pricePerCm?: number; fixedPrice?: number; enabled: boolean; products?: string[] }
export interface Config {
  products: Product[]
  types: Type[]
  materials: Material[]
  profiles: Profile[]
  formulas: Formula[]
  additions: { komarnik: Addition; roletna: Addition; okapnica: Addition; podprozorska: Addition; montaza: Addition }
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json')

export function getConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
}

export function saveConfig(data: Config): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8')
}
