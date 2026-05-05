import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, city, product, type, material, profile, width, height,
      komarnik, roletna, okapnica, podprozorska, total } = body

    if (!name || !email || !city) {
      return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email servis nije konfigurisan.' }, { status: 500 })
    }

    const html = `
<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;color:#1a1a2e;background:#f5f7fa;margin:0;padding:0}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:linear-gradient(135deg,#0d2f5e,#1a5fa8);padding:32px;color:#fff}
  .hdr h1{margin:0 0 4px;font-size:22px;font-weight:700}
  .hdr p{margin:0;font-size:13px;opacity:.7}
  .body{padding:28px 32px}
  .label{font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin:0 0 12px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px}
  .item{background:#f8fafc;border-radius:10px;padding:12px 16px}
  .item .l{font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;margin-bottom:4px}
  .item .v{font-size:15px;font-weight:600;color:#1a1a2e}
  .total{background:linear-gradient(135deg,#0d2f5e,#1a5fa8);border-radius:12px;padding:20px 24px;color:#fff;text-align:center;margin:8px 0 24px}
  .total .tl{font-size:12px;opacity:.7;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
  .total .amt{font-size:36px;font-weight:800}
  .total .note{font-size:11px;opacity:.55;margin-top:4px}
  .badge{display:inline-block;background:#ddeeff;color:#155ca8;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;margin-right:6px;margin-bottom:6px}
  .ftr{background:#f8fafc;padding:16px 32px;font-size:12px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>Nova ponuda sa kalkulatora</h1><p>PVC/ALU Stolarija</p></div>
  <div class="body">
    <p class="label">Podaci o kupcu</p>
    <div class="grid">
      <div class="item"><div class="l">Ime i prezime</div><div class="v">${name}</div></div>
      <div class="item"><div class="l">Email</div><div class="v">${email}</div></div>
      <div class="item" style="grid-column:span 2"><div class="l">Grad</div><div class="v">📍 ${city}</div></div>
    </div>
    <p class="label">Detalji konfiguracije</p>
    <div class="grid">
      <div class="item"><div class="l">Proizvod</div><div class="v">${product}</div></div>
      <div class="item"><div class="l">Tip</div><div class="v">${type}</div></div>
      <div class="item"><div class="l">Materijal</div><div class="v">${material}</div></div>
      <div class="item"><div class="l">Profil</div><div class="v">${profile}</div></div>
      <div class="item"><div class="l">Širina</div><div class="v">${width} mm</div></div>
      <div class="item"><div class="l">Visina</div><div class="v">${height} mm</div></div>
    </div>
    <p class="label">Dodaci</p>
    <div style="margin-bottom:20px">
      ${komarnik ? '<span class="badge">✓ Komarnik</span>' : ''}
      ${roletna ? '<span class="badge">✓ Roletna</span>' : ''}
      ${okapnica ? '<span class="badge">✓ Okapnica</span>' : ''}
      ${podprozorska ? '<span class="badge">✓ Pod-prozorska daska</span>' : ''}
      ${!komarnik && !roletna && !okapnica && !podprozorska ? '<span style="color:#9ca3af;font-size:13px">Bez dodataka</span>' : ''}
    </div>
    ${total != null ? `
    <div class="total">
      <div class="tl">Okvirna cena</div>
      <div class="amt">${Number(total).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
      <div class="note">* Bez PDV-a</div>
    </div>` : ''}
  </div>
  <div class="ftr">Bul. Mihajla Pupina 5, Novi Beograd • 011/770 24 35</div>
</div>
</body></html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Kalkulator <onboarding@resend.dev>',
        to: ['srecko.micic@gmail.com'],
        reply_to: email,
        subject: `Nova ponuda: ${product} ${type} – ${name} (${city})`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('Resend error:', err)
      return NextResponse.json({ error: 'Greška pri slanju emaila.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Greška servera.' }, { status: 500 })
  }
}
