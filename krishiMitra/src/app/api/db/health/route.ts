import { NextResponse } from 'next/server'
import { checkFirestoreConnection } from '@/lib/firestore-helpers'

export async function GET() {
  try {
    const isConnected = await checkFirestoreConnection()
    const now = new Date().toISOString()
    
    if (isConnected) {
      return NextResponse.json({ 
        ok: true, 
        database: 'Firestore',
        now 
      })
    } else {
      return NextResponse.json({ 
        ok: false, 
        error: 'Firestore connection failed' 
      }, { status: 500 })
    }
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: e?.message || String(e) 
    }, { status: 500 })
  }
}
