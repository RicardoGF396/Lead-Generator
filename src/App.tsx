import { useState } from "react";

const TERMS = [
  // Productos específicos
  { value: "brocales hierro ductil", label: "Brocales de hierro dúctil" },
  { value: "válvulas compuerta", label: "Válvulas de compuerta" },
  { value: "válvulas mariposa", label: "Válvulas mariposa" },
  { value: "conexiones hierro ductil", label: "Conexiones de hierro dúctil" },

  // Tiendas y distribuidores
  { value: "tubería hidráulica", label: "Tubería hidráulica" },
  { value: "ferretería industrial", label: "Ferretería industrial" },
  { value: "materiales hidráulicos", label: "Materiales hidráulicos" },
  { value: "distribuidora tubería", label: "Distribuidora de tubería" },
  { value: "válvulas industriales", label: "Válvulas industriales" },
  { value: "herrajes hidráulicos", label: "Herrajes hidráulicos" },

  // Clientes potenciales (quienes compran)
  { value: "constructora", label: "Constructora" },
  { value: "plomería", label: "Plomería / Plomeros" },
  {
    value: "fraccionamiento desarrollo",
    label: "Fraccionamiento / Desarrollo",
  },
  { value: "infraestructura hidráulica", label: "Infraestructura hidráulica" },
  { value: "ingeniería civil", label: "Ingeniería civil" },
  { value: "obra civil", label: "Obra civil" },
  { value: "servicios hidráulicos", label: "Servicios hidráulicos" },

  // Instaladores y contratistas
  { value: "instalación hidráulica", label: "Instalación hidráulica" },
  { value: "contratista obra", label: "Contratista de obra" },
  { value: "mantenimiento industrial", label: "Mantenimiento industrial" },
];

const CITIES_GTO = [
  { value: "León", label: "León" },
  { value: "Guanajuato", label: "Guanajuato (capital)" },
  { value: "San Miguel de Allende", label: "San Miguel de Allende" },
  { value: "Irapuato", label: "Irapuato" },
  { value: "Celaya", label: "Celaya" },
  { value: "Silao", label: "Silao" },
  { value: "Salamanca", label: "Salamanca" },
  { value: "San Francisco del Rincón", label: "San Francisco del Rincón" },
  { value: "Purísima del Rincón", label: "Purísima del Rincón" },
  { value: "Dolores Hidalgo", label: "Dolores Hidalgo" },
  { value: "San José Iturbide", label: "San José Iturbide" },
  { value: "Pénjamo", label: "Pénjamo" },
  { value: "Salvatierra", label: "Salvatierra" },
  { value: "Valle de Santiago", label: "Valle de Santiago" },
  { value: "Cortazar", label: "Cortazar" },
  { value: "Moroleón", label: "Moroleón" },
  { value: "Uriangato", label: "Uriangato" },
  { value: "Acámbaro", label: "Acámbaro" },
  { value: "Juventino Rosas", label: "Juventino Rosas" },
  { value: "Villagrán", label: "Villagrán" },
];

type Lead = {
  query?: string;
  name?: string;
  address?: string;
  phone?: string;
  phoneLink?: string;
  mapsLink?: string;
  website?: string;
  emails?: string[];
  rating?: number;
  reviews?: number;
  status?: string;
  error?: string;
};

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function copyTableToClipboard(results: Lead[]) {
  const headers = [
    "Búsqueda",
    "Nombre",
    "Dirección",
    "Teléfono",
    "Website",
    "Emails",
    "Rating",
    "Reseñas",
    "Estado",
  ];
  const rows = results.map((r) => [
    r.query || "",
    r.name || "",
    r.address || "",
    r.phone || "",
    r.website || "",
    (r.emails || []).join(" | "),
    r.rating?.toString() || "",
    r.reviews?.toString() || "",
    r.status || (r.error ? `Error: ${r.error}` : ""),
  ]);

  const tsv = [headers, ...rows].map((row) => row.join("\t")).join("\n");
  navigator.clipboard.writeText(tsv);
  alert("Tabla copiada al portapapeles");
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState(TERMS[0].value);
  const [selectedCity, setSelectedCity] = useState(CITIES_GTO[0].value);
  const [limit, setLimit] = useState(20);

  const handleEnrich = async () => {
    setError(null);
    setLoading(true);
    try {
      const query = `${selectedTerm} ${selectedCity} Guanajuato`;
      const data = await postJSON<{ results: Lead[] }>("/api/enrichText", {
        query,
        limit,
      });
      setResults(data.results);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <style>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
          background: #fafafa;
        }
        
        .container {
          max-width: 980px;
          margin: 0 auto;
          padding: 16px;
        }
        
        h1 {
          font-size: clamp(20px, 5vw, 28px);
          margin: 16px 0 8px;
          color: #111;
        }
        
        .subtitle {
          opacity: 0.7;
          margin-bottom: 20px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        @media (min-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr 1fr auto;
            align-items: end;
          }
        }
        
        .form-field {
          display: flex;
          flex-direction: column;
        }
        
        label {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 6px;
          font-weight: 500;
        }
        
        select, input, textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #d0d0d0;
          font-size: 14px;
          font-family: inherit;
          background: white;
        }
        
        select:focus, input:focus, textarea:focus {
          outline: none;
          border-color: #111;
        }
        
        textarea {
          min-height: 120px;
          resize: vertical;
        }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 12px;
        }
        
        @media (min-width: 480px) {
          .button-group {
            flex-direction: row;
          }
        }
        
        button {
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          flex: 1;
        }
        
        @media (min-width: 480px) {
          button {
            flex: initial;
          }
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-primary {
          background: #111;
          color: white;
          border: 1px solid transparent;
        }
        
        .btn-primary:not(:disabled):hover {
          background: #333;
        }
        
        .btn-secondary {
          background: white;
          color: #111;
          border: 1px solid #111;
        }
        
        .btn-secondary:not(:disabled):hover {
          background: #f5f5f5;
        }
        
        .error {
          margin-top: 12px;
          padding: 12px;
          background: #fff1f0;
          color: #b00020;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .results-header {
          font-size: 18px;
          margin: 24px 0 12px;
          color: #111;
        }
        
        /* Tabla desktop */
        .table-container {
          display: none;
          overflow-x: auto;
          border: 1px solid #eee;
          border-radius: 10px;
          background: white;
        }
        
        @media (min-width: 1024px) {
          .table-container {
            display: block;
          }
          .cards-container {
            display: none;
          }
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          text-align: left;
          padding: 12px;
          background: #fafafa;
          border-bottom: 1px solid #eee;
          font-weight: 600;
          font-size: 13px;
          white-space: nowrap;
        }
        
        td {
          padding: 12px;
          border-bottom: 1px solid #f5f5f5;
          font-size: 14px;
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        /* Tarjetas móvil */
        .cards-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .card {
          background: white;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .card-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #f5f5f5;
        }
        
        .card-row:last-child {
          border-bottom: none;
        }
        
        .card-label {
          font-weight: 600;
          font-size: 12px;
          opacity: 0.7;
          min-width: 90px;
          flex-shrink: 0;
        }
        
        .card-value {
          font-size: 14px;
          word-break: break-word;
        }
        
        .card-value a {
          color: #0066cc;
          text-decoration: none;
        }
        
        .card-value a:hover {
          text-decoration: underline;
        }
        
        .empty-state {
          padding: 40px 20px;
          text-align: center;
          opacity: 0.6;
          font-size: 14px;
          background: white;
          border: 1px solid #eee;
          border-radius: 10px;
        }
        
        .note {
          margin-top: 16px;
          font-size: 12px;
          opacity: 0.6;
          line-height: 1.5;
        }
      `}</style>

      <h1>Enriquecedor de Leads - Tubería Industrial</h1>
      <p className="subtitle">
        Busca clientes potenciales para tubería, válvulas y conexiones en
        Guanajuato. Ej.: <i>"válvulas compuerta León Guanajuato"</i>,{" "}
        <i>"ferretería industrial Celaya"</i>
      </p>

      <div className="form-grid">
        <div className="form-field">
          <label>Tipo de negocio / producto</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            {TERMS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Ciudad (Guanajuato)</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {CITIES_GTO.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Límite de resultados</label>
          <input
            type="number"
            min={1}
            max={60}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="button-group">
        <button
          onClick={handleEnrich}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Buscando…" : "Buscar leads"}
        </button>

        <button
          onClick={() => copyTableToClipboard(results)}
          disabled={results.length === 0}
          className="btn-secondary"
        >
          Copiar a Excel
        </button>
      </div>

      {error && <div className="error">⚠️ {error}</div>}

      <h2 className="results-header">Resultados ({results.length})</h2>

      {/* Vista de tabla para desktop */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {[
                "Búsqueda",
                "Nombre",
                "Dirección",
                "Teléfono",
                "Website",
                "Emails",
                "Rating",
                "Reseñas",
                "Estado",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.query}</td>
                <td>{r.name || "—"}</td>
                <td>
                  {r.address ? (
                    <a
                      href={
                        r.mapsLink ||
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          r.address
                        )}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.address}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>

                <td>
                  {r.phone ? (
                    <a
                      href={r.phoneLink || `tel:${r.phone.replace(/\s/g, "")}`}
                    >
                      {r.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>

                <td>
                  {r.website ? (
                    <a href={r.website} target="_blank" rel="noreferrer">
                      Link
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{(r.emails || []).join(" | ") || "—"}</td>
                <td>{r.rating ?? "—"}</td>
                <td>{r.reviews ?? "—"}</td>
                <td>{r.status || (r.error ? `Error: ${r.error}` : "—")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && !loading && (
          <div className="empty-state">No hay resultados aún.</div>
        )}
      </div>

      {/* Vista de tarjetas para móvil */}
      <div className="cards-container">
        {results.map((r, i) => (
          <div key={i} className="card">
            <div className="card-row">
              <span className="card-label">Búsqueda:</span>
              <span className="card-value">{r.query || "—"}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Nombre:</span>
              <span className="card-value">{r.name || "—"}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Dirección:</span>
              <span className="card-value">
                {r.address ? (
                  <a
                    href={
                      r.mapsLink ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        r.address
                      )}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {r.address}
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>

            <div className="card-row">
              <span className="card-label">Teléfono:</span>
              <span className="card-value">
                {r.phone ? (
                  <a href={r.phoneLink || `tel:${r.phone.replace(/\s/g, "")}`}>
                    {r.phone}
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">Website:</span>
              <span className="card-value">
                {r.website ? (
                  <a href={r.website} target="_blank" rel="noreferrer">
                    {r.website}
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">Emails:</span>
              <span className="card-value">
                {(r.emails || []).join(", ") || "—"}
              </span>
            </div>
            <div className="card-row">
              <span className="card-label">Rating:</span>
              <span className="card-value">{r.rating ?? "—"}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Reseñas:</span>
              <span className="card-value">{r.reviews ?? "—"}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Estado:</span>
              <span className="card-value">
                {r.status || (r.error ? `Error: ${r.error}` : "—")}
              </span>
            </div>
          </div>
        ))}
        {results.length === 0 && !loading && (
          <div className="empty-state">No hay resultados aún.</div>
        )}
      </div>

      <p className="note">
        Búsqueda actual: "
        <strong>
          {selectedTerm} {selectedCity} Guanajuato
        </strong>
        "
      </p>
    </div>
  );
}
