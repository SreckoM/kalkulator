'use client'

import { useEffect, useState } from 'react'
import type { Config, PriceEntry } from '@/lib/config'

const PW_KEY = 'admin_pw'

const EMPTY: Partial<PriceEntry> = {
  product: '', material: '', profile: '', staklo: '',
  width: undefined, height: undefined, price: undefined,
  roletna: 0, komarnik: 0, okapnica: 0, podprozorska: 0,
  rabat: 0, pdv: 0,
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [storedPw, setStoredPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [newEntry, setNewEntry] = useState<Partial<PriceEntry>>({ ...EMPTY })
  const [filterProduct, setFilterProduct] = useState('')
  const [filterMaterial, setFilterMaterial] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    const pw = sessionStorage.getItem(PW_KEY)
    if (pw) { setStoredPw(pw); tryLoad(pw) }
  }, [])

  async function tryLoad(pw: string) {
    setLoading(true)
    try {
      const [authRes, configRes] = await Promise.all([
        fetch('/api/auth', { method: 'POST', headers: { 'x-admin-password': pw } }),
        fetch('/api/config'),
      ])
      if (authRes.ok && configRes.ok) {
        const data = await configRes.json()
        setConfig(data)
        setAuthed(true)
        sessionStorage.setItem(PW_KEY, pw)
        setStoredPw(pw)
      } else if (!authRes.ok) {
        setAuthError('Pogrešna lozinka.')
      } else {
        setAuthError('Greška pri učitavanju.')
      }
    } catch {
      setAuthError('Greška pri učitavanju.')
    }
    setLoading(false)
  }

  async function handleImport(file: File) {
    setImporting(true)
    setImportResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'x-admin-password': storedPw },
        body: form,
      })
      const data = await res.json()
      if (res.ok) {
        setImportResult({ ok: true, msg: `Uspešno uvezeno ${data.count} unosa.` })
        // reload config from server
        const cfg = await fetch('/api/config').then(r => r.json())
        setConfig(cfg)
      } else {
        setImportResult({ ok: false, msg: data.error || 'Greška pri uvozu.' })
      }
    } catch {
      setImportResult({ ok: false, msg: 'Greška pri uvozu.' })
    }
    setImporting(false)
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

  function addEntry() {
    if (!config) return
    const { product, material, profile, staklo, width, height, price, roletna, komarnik, okapnica, podprozorska } = newEntry
    if (!product || !material || !profile || width === undefined || height === undefined || price === undefined) return
    const entry: PriceEntry = {
      product, material, profile, staklo: staklo ?? '',
      width, height, price,
      roletna: roletna ?? 0, komarnik: komarnik ?? 0,
      okapnica: okapnica ?? 0, podprozorska: podprozorska ?? 0,
      rabat: newEntry.rabat ?? 0, pdv: newEntry.pdv ?? 0,
    }
    setConfig({ ...config, pricelist: [...config.pricelist, entry] })
    setNewEntry({ ...EMPTY })
  }

  function deleteEntry(idx: number) {
    if (!config) return
    setConfig({ ...config, pricelist: config.pricelist.filter((_, i) => i !== idx) })
  }

  function updateEntry(idx: number, field: keyof PriceEntry, value: string) {
    if (!config) return
    const numFields: (keyof PriceEntry)[] = ['width', 'height', 'price', 'roletna', 'komarnik', 'okapnica', 'podprozorska']
    setConfig({
      ...config,
      pricelist: config.pricelist.map((e, i) => i !== idx ? e : {
        ...e,
        [field]: numFields.includes(field) ? (parseFloat(value) || 0) : value,
      })
    })
  }

  function updateMontaza(field: 'fixedPrice' | 'enabled', value: string | boolean) {
    if (!config) return
    setConfig({ ...config, montaza: { ...config.montaza, [field]: field === 'fixedPrice' ? parseFloat(value as string) || 0 : value } })
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d2f5e, #1a5fa8)' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
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

  const pl = config.pricelist
  const allProducts = Array.from(new Set(pl.map(e => e.product)))
  const allMaterials = Array.from(new Set(pl.map(e => e.material)))
  const allProfiles = Array.from(new Set(pl.map(e => e.profile)))

  const filtered = pl.filter(e =>
    (!filterProduct || e.product === filterProduct) &&
    (!filterMaterial || e.material === filterMaterial)
  )

  // Cascading options for "add new" form
  const newProductOptions = Array.from(new Set(pl.filter(e => !newEntry.material || e.material === newEntry.material).map(e => e.product)))
  const newProfileOptions = Array.from(new Set(pl.filter(e => !newEntry.material || e.material === newEntry.material).map(e => e.profile)))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-10">
        <span className="font-bold text-lg">Admin</span>
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

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Excel import */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Uvoz iz Excel-a</h2>
            <p className="text-xs text-gray-400 mt-0.5">Učitava .xlsx fajl i zamenjuje ceo cenovnik. Ostale postavke (montaža, header, footer) ostaju nepromenjene.</p>
          </div>
          <div className="px-6 py-5 flex items-center gap-4 flex-wrap">
            <label className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed cursor-pointer transition-all ${importing ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}`}>
              {importing
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Uvoz u toku...</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Izaberi .xlsx fajl</>
              }
              <input type="file" accept=".xlsx" className="hidden" disabled={importing}
                onChange={e => { const f = e.target.files?.[0]; if (f) { handleImport(f); e.target.value = '' } }} />
            </label>
            {importResult && (
              <div className={`text-sm font-medium ${importResult.ok ? 'text-green-600' : 'text-red-500'}`}>
                {importResult.ok ? '✅' : '❌'} {importResult.msg}
              </div>
            )}
          </div>
        </div>

        {/* Add new entry */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Dodaj novi unos</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            {/* Identification fields */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Materijal</label>
                <input list="materials-list" value={newEntry.material ?? ''} placeholder="npr. PVC"
                  onChange={e => setNewEntry({ ...newEntry, material: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                <datalist id="materials-list">{allMaterials.map(m => <option key={m} value={m} />)}</datalist>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Proizvod</label>
                <input list="products-list" value={newEntry.product ?? ''} placeholder="npr. Jednokrilni prozor"
                  onChange={e => setNewEntry({ ...newEntry, product: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                <datalist id="products-list">{newProductOptions.map(p => <option key={p} value={p} />)}</datalist>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Profil</label>
                <input list="profiles-list" value={newEntry.profile ?? ''} placeholder="npr. Kemerling 70"
                  onChange={e => setNewEntry({ ...newEntry, profile: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                <datalist id="profiles-list">{newProfileOptions.map(p => <option key={p} value={p} />)}</datalist>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Staklo</label>
                <select value={newEntry.staklo ?? ''} onChange={e => setNewEntry({ ...newEntry, staklo: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
                  <option value="">Ne važi (vrata)</option>
                  <option value="Dvoslojno">Dvoslojno</option>
                  <option value="Troslojno">Troslojno</option>
                </select>
              </div>
            </div>

            {/* Dimensions and base price */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Širina (mm)</label>
                <input type="number" min="1" placeholder="npr. 1200" value={newEntry.width ?? ''}
                  onChange={e => setNewEntry({ ...newEntry, width: parseFloat(e.target.value) || undefined })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Visina (mm)</label>
                <input type="number" min="1" placeholder="npr. 1400" value={newEntry.height ?? ''}
                  onChange={e => setNewEntry({ ...newEntry, height: parseFloat(e.target.value) || undefined })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Cena (€)</label>
                <input type="number" min="0" step="0.01" placeholder="npr. 150" value={newEntry.price ?? ''}
                  onChange={e => setNewEntry({ ...newEntry, price: parseFloat(e.target.value) || undefined })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 focus:outline-none focus:border-blue-400" />
              </div>
            </div>

            {/* Addition prices */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['roletna', 'komarnik', 'okapnica', 'podprozorska'] as const).map(k => (
                <div key={k}>
                  <label className="block text-xs text-gray-400 mb-1">{k === 'podprozorska' ? 'Pod-prozorska daska' : k.charAt(0).toUpperCase() + k.slice(1)} (€)</label>
                  <input type="number" min="0" step="0.01" placeholder="0 = ne prikazuj" value={newEntry[k] ?? 0}
                    onChange={e => setNewEntry({ ...newEntry, [k]: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-400" />
                </div>
              ))}
            </div>

            {/* Rabat and PDV */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Rabat (%)</label>
                <input type="number" min="0" max="100" step="1" value={newEntry.rabat ?? 0}
                  onChange={e => setNewEntry({ ...newEntry, rabat: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-orange-600 focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">PDV (%)</label>
                <input type="number" min="0" max="100" step="1" value={newEntry.pdv ?? 0}
                  onChange={e => setNewEntry({ ...newEntry, pdv: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-orange-600 focus:outline-none focus:border-blue-400" />
              </div>
            </div>

            <button onClick={addEntry}
              disabled={!newEntry.product || !newEntry.material || !newEntry.profile || !newEntry.width || !newEntry.height || newEntry.price === undefined}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
              + Dodaj unos
            </button>
          </div>
        </div>

        {/* Pricelist table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <h2 className="font-bold text-gray-800">Cenovnik <span className="text-gray-400 font-normal text-sm">({filtered.length} unosa)</span></h2>
            <div className="flex gap-2 ml-auto flex-wrap">
              <select value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white">
                <option value="">Svi materijali</option>
                {allMaterials.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white">
                <option value="">Svi proizvodi</option>
                {allProducts.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">Nema unosa. Koristite formu iznad da dodate prvi unos.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {['Materijal', 'Proizvod', 'Profil', 'Staklo', 'Š (mm)', 'V (mm)', 'Cena €', 'Roletna €', 'Komarnik €', 'Okapnica €', 'Pod-proz. €', 'Rabat %', 'PDV %', ''].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs text-gray-400 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {config.pricelist.map((e, idx) => {
                    if (filterProduct && e.product !== filterProduct) return null
                    if (filterMaterial && e.material !== filterMaterial) return null
                    return (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-3 py-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${e.material.toLowerCase() === 'pvc' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{e.material}</span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 min-w-32">{e.product}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{e.profile}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">{e.staklo || '—'}</td>
                        {(['width', 'height', 'price', 'roletna', 'komarnik', 'okapnica', 'podprozorska'] as const).map(field => (
                          <td key={field} className="px-3 py-2">
                            <input type="number" min="0" step={['price', 'roletna', 'komarnik', 'okapnica', 'podprozorska'].includes(field) ? '0.01' : '1'}
                              value={e[field]}
                              onChange={ev => updateEntry(idx, field, ev.target.value)}
                              className={`w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-right focus:outline-none focus:border-blue-400 ${['price', 'roletna', 'komarnik', 'okapnica', 'podprozorska'].includes(field) ? 'text-blue-700' : 'text-gray-700'}`} />
                          </td>
                        ))}
                        {(['rabat', 'pdv'] as const).map(field => (
                          <td key={field} className="px-3 py-2">
                            <input type="number" min="0" max="100" step="1"
                              value={e[field]}
                              onChange={ev => updateEntry(idx, field, ev.target.value)}
                              className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-right text-orange-600 focus:outline-none focus:border-blue-400" />
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <button onClick={() => deleteEntry(idx)} title="Obriši"
                            className="text-red-400 hover:text-red-600 text-lg leading-none cursor-pointer transition-colors">×</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Montaža */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Montaža</h2>
          </div>
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-700">Fiksna cena ugradnje</div>
              <div className="text-xs text-gray-400">Prikazuje se kao opcioni dodatak na kraju kalkulatora</div>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" step="1" value={config.montaza.fixedPrice}
                onChange={e => updateMontaza('fixedPrice', e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
              <span className="text-gray-400 text-sm">€</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.montaza.enabled}
                onChange={e => updateMontaza('enabled', e.target.checked)}
                className="rounded w-4 h-4 accent-blue-700" />
              <span className="text-xs text-gray-500">Aktivan</span>
            </label>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Header</h2>
            <p className="text-xs text-gray-400 mt-0.5">Naslov i podnaslov kalkulatora</p>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Naslov</label>
              <input value={config.header?.title ?? ''}
                onChange={e => setConfig({ ...config, header: { ...config.header, title: e.target.value } })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Podnaslov</label>
              <input value={config.header?.subtitle ?? ''}
                onChange={e => setConfig({ ...config, header: { ...config.header, subtitle: e.target.value } })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Napomena ispod cene</label>
              <input value={config.header?.disclaimer ?? ''}
                onChange={e => setConfig({ ...config, header: { ...config.header, disclaimer: e.target.value } })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Footer</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tekstualni redovi ispod kalkulatora (adresa, telefon...)</p>
          </div>
          <div className="px-6 py-5 space-y-2">
            {(config.footer?.lines ?? []).map((line, i) => (
              <div key={i} className="flex gap-2">
                <input value={line}
                  onChange={e => {
                    const lines = [...(config.footer?.lines ?? [])]
                    lines[i] = e.target.value
                    setConfig({ ...config, footer: { lines } })
                  }}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                <button onClick={() => {
                  const lines = (config.footer?.lines ?? []).filter((_, j) => j !== i)
                  setConfig({ ...config, footer: { lines } })
                }} className="text-red-400 hover:text-red-600 text-lg leading-none px-2 cursor-pointer">×</button>
              </div>
            ))}
            <button onClick={() => {
              const lines = [...(config.footer?.lines ?? []), '']
              setConfig({ ...config, footer: { lines } })
            }} className="text-blue-600 hover:text-blue-800 text-sm font-semibold cursor-pointer">+ Dodaj red</button>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={loading}
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-10 rounded-xl transition-all disabled:opacity-50 cursor-pointer">
            {loading ? 'Čuvanje...' : '💾 Sačuvaj sve promene'}
          </button>
        </div>
      </div>
    </div>
  )
}
