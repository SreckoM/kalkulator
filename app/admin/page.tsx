'use client'

import { useEffect, useState } from 'react'
import type { Config, Product, Type, Material, Profile } from '@/lib/config'

const PW_KEY = 'admin_pw'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [storedPw, setStoredPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [activeTab, setActiveTab] = useState<'products' | 'types' | 'materials' | 'profiles' | 'additions'>('products')

  useEffect(() => {
    const pw = sessionStorage.getItem(PW_KEY)
    if (pw) { setStoredPw(pw); tryLoad(pw) }
  }, [])

  async function tryLoad(pw: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/config')
      if (!res.ok) throw new Error()
      const data = await res.json()
      // verify password
      const v = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify(data),
      })
      if (v.ok) {
        setConfig(data)
        setAuthed(true)
        sessionStorage.setItem(PW_KEY, pw)
        setStoredPw(pw)
      } else {
        setAuthError('Pogrešna lozinka.')
      }
    } catch {
      setAuthError('Greška pri učitavanju.')
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!config) return
    setSaved(false); setSaveError('')
    setLoading(true)
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw },
      body: JSON.stringify(config),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else setSaveError('Greška pri čuvanju.')
    setLoading(false)
  }

  // Update helpers
  function updateProduct(id: string, field: keyof Product, value: string | number) {
    if (!config) return
    setConfig({ ...config, profiles: config.profiles, products: config.products.map(p => p.id === id ? { ...p, [field]: typeof value === 'string' && field === 'factor' ? parseFloat(value) || 0 : value } : p) })
  }
  function updateType(id: string, field: keyof Type, value: string | number) {
    if (!config) return
    setConfig({ ...config, types: config.types.map(t => t.id === id ? { ...t, [field]: field === 'factor' ? parseFloat(value as string) || 0 : value } : t) })
  }
  function updateMaterial(id: string, field: keyof Material, value: string | number) {
    if (!config) return
    setConfig({ ...config, materials: config.materials.map(m => m.id === id ? { ...m, [field]: field === 'pricePerCm2' ? parseFloat(value as string) || 0 : value } : m) })
  }
  function updateProfile(id: string, field: keyof Profile, value: string | number) {
    if (!config) return
    setConfig({ ...config, profiles: config.profiles.map(p => p.id === id ? { ...p, [field]: field === 'factor' ? parseFloat(value as string) || 0 : value } : p) })
  }
  function updateAddition(key: string, field: string, value: string | number | boolean) {
    if (!config) return
    setConfig({
      ...config,
      additions: {
        ...config.additions,
        [key]: { ...config.additions[key as keyof Config['additions']], [field]: typeof value === 'string' ? parseFloat(value) || 0 : value }
      }
    })
  }

  const tabs = [
    { key: 'products', label: 'Proizvodi' },
    { key: 'types', label: 'Tipovi' },
    { key: 'materials', label: 'Materijali' },
    { key: 'profiles', label: 'Profili' },
    { key: 'additions', label: 'Dodaci' },
  ] as const

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d2f5e, #1a5fa8)' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1"></p>
          </div>
          <div className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryLoad(password)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500" placeholder="Lozinka" autoFocus />
            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            <button onClick={() => tryLoad(password)} disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer">
              {loading ? 'Prijavljivanje...' : 'Prijavi se'}
            </button>
          </div>
          <div className="text-center mt-6">
            <a href="/kalkulator" className="text-blue-600 hover:underline text-sm">← Nazad na kalkulator</a>
          </div>
        </div>
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">Admin</span>
          <span className="text-blue-300 text-sm hidden sm:inline"></span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/kalkulator" className="text-blue-300 hover:text-white text-sm transition-colors">← Kalkulator</a>
          <button onClick={handleSave} disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-2 px-5 rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer">
            {loading ? 'Čuvanje...' : '💾 Sačuvaj'}
          </button>
        </div>
      </div>

      {saved && <div className="bg-green-50 border-l-4 border-green-500 px-6 py-3 text-green-800 text-sm font-medium">✅ Sačuvano!</div>}
      {saveError && <div className="bg-red-50 border-l-4 border-red-500 px-6 py-3 text-red-800 text-sm font-medium">❌ {saveError}</div>}

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === t.key ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Products tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Proizvodi i faktori</h2>
              <p className="text-gray-400 text-xs mt-0.5">Faktor se množi sa osnovnom cenom</p>
            </div>
            {config.products.map((p: Product) => (
              <div key={p.id} className="px-6 py-4 flex items-center gap-4 border-b border-gray-50 hover:bg-gray-50">
                <input value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-400" />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-400 text-sm">faktor ×</span>
                  <input type="number" step="0.05" value={p.factor} onChange={e => updateProduct(p.id, 'factor', e.target.value)}
                    className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Types tab */}
        {activeTab === 'types' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Tipovi otvaranja i faktori</h2>
            </div>
            {config.types.map((t: Type) => (
              <div key={t.id} className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <input value={t.name} onChange={e => updateType(t.id, 'name', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-400" />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-gray-400 text-sm">×</span>
                    <input type="number" step="0.01" value={t.factor} onChange={e => updateType(t.id, 'factor', e.target.value)}
                      className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {(['prozor', 'balkon', 'podizno'] as const).map(prod => (
                    <label key={prod} className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500">
                      <input type="checkbox" checked={t.products.includes(prod)}
                        onChange={e => updateType(t.id, 'products' as any, e.target.checked ? [...t.products, prod] : t.products.filter(x => x !== prod))}
                        className="rounded" />
                      {prod}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Materials tab */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Materijali i cene</h2>
              <p className="text-gray-400 text-xs mt-0.5">Cena po cm²</p>
            </div>
            {config.materials.map((m: Material) => (
              <div key={m.id} className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <input value={m.name} onChange={e => updateMaterial(m.id, 'name', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-400" />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input type="number" step="0.1" value={m.pricePerCm2} onChange={e => updateMaterial(m.id, 'pricePerCm2', e.target.value)}
                      className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                    <span className="text-gray-400 text-sm">€/cm²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profiles tab */}
        {activeTab === 'profiles' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">Profili</h2>
                <p className="text-gray-400 text-xs mt-0.5">Faktor, naziv i URL slike za svaki profil</p>
              </div>
              {config.profiles.map((p: Profile) => (
                <div key={p.id} className="px-6 py-5 border-b border-gray-50 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Image preview */}
                    <div className="flex-shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-20 h-16 object-cover rounded-lg border border-gray-200" />
                      ) : (
                        <div className="w-20 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs text-center">
                          nema slike
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input value={p.name} onChange={e => updateProfile(p.id, 'name', e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-400" />
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-gray-400 text-sm">×</span>
                          <input type="number" step="0.05" value={p.factor} onChange={e => updateProfile(p.id, 'factor', e.target.value)}
                            className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                        </div>
                      </div>
                      <input value={p.image} onChange={e => updateProfile(p.id, 'image', e.target.value)}
                        placeholder="URL slike (https://...)"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 focus:outline-none focus:border-blue-400" />
                      <div className="text-xs text-gray-400">Materijal: <span className="font-semibold text-gray-600">{p.material.toUpperCase()}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-xs text-center">Slike se dodaju kao URL link. Uploadujte slike na hosting i unesite URL.</p>
          </div>
        )}

        {/* Additions tab */}
        {activeTab === 'additions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Dodaci i cene</h2>
            </div>
            {([
              { key: 'komarnik', label: 'Komarnik', field: 'pricePerCm2', unit: '€/cm²', desc: 'Cena × širina × visina' },
              { key: 'roletna', label: 'Roletna', field: 'pricePerCm2', unit: '€/cm²', desc: 'Cena × širina × visina' },
              { key: 'okapnica', label: 'Okapnica', field: 'pricePerCm', unit: '€/cm', desc: 'Cena × širina' },
              { key: 'podprozorska', label: 'Pod-prozorska daska', field: 'pricePerCm', unit: '€/cm', desc: 'Cena × širina' },
            ] as const).map(a => {
              const addon = config.additions[a.key as keyof Config['additions']]
              const val = a.field === 'pricePerCm2' ? addon.pricePerCm2 : addon.pricePerCm
              return (
                <div key={a.key} className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-700">{a.label}</div>
                      <div className="text-xs text-gray-400">{a.desc}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <input type="number" step="0.1" value={val ?? 0}
                        onChange={e => updateAddition(a.key, a.field, e.target.value)}
                        className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                      <span className="text-gray-400 text-sm">{a.unit}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                      <input type="checkbox" checked={addon.enabled}
                        onChange={e => updateAddition(a.key, 'enabled', e.target.checked)}
                        className="rounded w-4 h-4 accent-blue-700" />
                      <span className="text-xs text-gray-500">Aktivan</span>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button onClick={handleSave} disabled={loading}
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-10 rounded-xl transition-all disabled:opacity-50 cursor-pointer">
            {loading ? 'Čuvanje...' : '💾 Sačuvaj sve promene'}
          </button>
        </div>
      </div>
    </div>
  )
}
