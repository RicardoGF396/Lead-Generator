import type { Lead } from "../types"

export function copyTableToClipboard(rows: Lead[]) {
    if (rows.length === 0) return

    const headers = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ]

    const lines = rows.map(r => {
        // Corrige teléfono
        let phone = r.phone || ""
        if (phone.startsWith("+")) {
            phone = "'" + phone   // opción 1: apóstrofe
            // phone = `="${phone}"`  // opción 2: formula de texto
        }

        return [
            r.query,
            r.name || "",
            r.address || "",
            phone,
            r.website || "",
            (r.emails || []).join(" | "),
            r.rating ?? "",
            r.reviews ?? "",
            r.status ?? (r.error ? `Error: ${r.error}` : "")
        ].join("\t")
    })


    const text = [headers.join("\t"), ...lines].join("\n")

    navigator.clipboard.writeText(text)
        .then(() => {
            alert("Tabla copiada al portapapeles ✅ Pega ahora en Excel o Google Sheets")
        })
        .catch(err => {
            console.error("Error copiando:", err)
            alert("No se pudo copiar al portapapeles ❌")
        })
}
