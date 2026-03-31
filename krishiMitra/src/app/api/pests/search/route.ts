import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').toLowerCase()
  const crop = (searchParams.get('crop') || '').toLowerCase()
  const region = (searchParams.get('region') || '').toLowerCase()
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  try {
    const filePath = path.resolve(process.cwd(), 'data', 'pests.large.json')
    const exists = fs.existsSync(filePath)
    const dataPath = exists ? filePath : path.resolve(process.cwd(), 'data', 'pests.base.json')
    const raw = fs.readFileSync(dataPath, 'utf-8')
    const items = JSON.parse(raw) as any[]

    const results = items.filter((it) => {
      const hq = !q ||
        it.name?.toLowerCase().includes(q) ||
        it.symptoms?.toLowerCase().includes(q) ||
        it.remedy?.toLowerCase().includes(q)
      const hc = !crop || it.crop?.toLowerCase().includes(crop)
      const hr = !region || (it.region || '').toLowerCase().includes(region)
      return hq && hc && hr
    }).slice(0, Math.max(1, Math.min(500, limit)))

    return NextResponse.json({ count: results.length, results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Search failed' }, { status: 500 })
  }
}
