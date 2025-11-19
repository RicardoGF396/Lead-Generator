export type Lead = {
    query: string
    place_id?: string
    name?: string
    address?: string
    phone?: string
    website?: string
    emails?: string[]
    rating?: number | null
    reviews?: number
    status?: string
    error?: string
}
