import Papa from 'papaparse'
import type { Lead } from '../types'

export function downloadCsv(filename: string, rows: Lead[]) {
    const csv = Papa.unparse(
        rows.map(r => ({
            query: r.query,
            name: r.name || '',
            address: r.address || '',
            phone: r.phone || '',
            website: r.website || '',
            emails: (r.emails || []).join(' | '),
            rating: r.rating ?? '',
            reviews: r.reviews ?? '',
            status: r.status ?? '',
            place_id: r.place_id || ''
        }))
    )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
