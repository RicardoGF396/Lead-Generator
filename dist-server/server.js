import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { scrapeEmailsFromWebsite, sleep } from './helpers.js';
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();
app.use(cors());
app.use(express.json());
// Esto es necesario porque estás usando "type": "module"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ruta a la carpeta dist del cliente
const clientDistPath = path.join(__dirname, '../dist');
// Servir archivos estáticos del build de Vite
app.use(express.static(clientDistPath));
// Cualquier ruta que no empiece con /api la mandas a index.html (SPA)
const PORT = process.env.PORT || 5174;
const API_KEY = process.env.PLACES_API_KEY;
if (!API_KEY) {
    console.error('Missing PLACES_API_KEY in .env');
    process.exit(1);
}
/**
 * GET /api/find?query=texto
 * Devuelve { place_id } para una búsqueda de texto (Places API v1)
 */
app.get('/api/find', async (req, res) => {
    try {
        const query = String(req.query.query || '');
        if (!query)
            return res.status(400).json({ error: 'Missing query' });
        const url = 'https://places.googleapis.com/v1/places:searchText';
        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'places.id'
        };
        const body = { textQuery: query, languageCode: 'es', regionCode: 'MX' };
        const { data } = await axios.post(url, body, { headers });
        const place_id = data?.places?.[0]?.id ?? null;
        res.json({ place_id });
    }
    catch (err) {
        console.error('[find v1] ERROR', err?.response?.data || err?.message);
        res.status(500).json({ error: err.message || 'find error' });
    }
});
/**
 * GET /api/details?place_id=XYZ
 * Devuelve detalles clave y trata de obtener emails del sitio
 */
app.get('/api/details', async (req, res) => {
    try {
        const placeId = String(req.query.place_id || '');
        if (!placeId)
            return res.status(400).json({ error: 'Missing place_id' });
        const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
        const headers = {
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': [
                'id',
                'displayName.text',
                'formattedAddress',
                'internationalPhoneNumber',
                'nationalPhoneNumber',
                'websiteUri',
                'rating',
                'userRatingCount',
                'businessStatus'
            ].join(',')
        };
        const params = { languageCode: 'es', regionCode: 'MX' };
        const { data } = await axios.get(url, { headers, params });
        const phone = data.internationalPhoneNumber || data.nationalPhoneNumber || '';
        let emails = [];
        if (data.websiteUri) {
            emails = await scrapeEmailsFromWebsite(data.websiteUri);
            await sleep(250);
        }
        // Construir links útiles
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(placeId)}`;
        const phoneLink = phone ? `tel:${phone.replace(/\s/g, '')}` : '';
        res.json({
            place_id: data.id,
            name: data.displayName?.text ?? '',
            address: data.formattedAddress ?? '',
            phone,
            phoneLink,
            mapsLink,
            website: data.websiteUri ?? '',
            rating: data.rating ?? null,
            reviews: data.userRatingCount ?? 0,
            status: data.businessStatus ?? '',
            emails
        });
    }
    catch (err) {
        console.error('[details v1] ERROR', err?.response?.data || err?.message);
        res.status(500).json({ error: err.message || 'details error' });
    }
});
/**
 * GET /api/searchText?query=texto&limit=20
 * Busca múltiples lugares por texto
 */
app.get('/api/searchText', async (req, res) => {
    try {
        const query = String(req.query.query || '');
        const limit = Number(req.query.limit || 20);
        if (!query)
            return res.status(400).json({ error: 'Missing query' });
        const url = 'https://places.googleapis.com/v1/places:searchText';
        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName.text,places.formattedAddress,places.rating,places.userRatingCount'
        };
        const body = {
            textQuery: query,
            languageCode: 'es',
            regionCode: 'MX'
            // Opcional: sesgo geográfico
            // locationBias: { circle: { center: { latitude: 21.125, longitude: -101.6869 }, radius: 30000 } }
        };
        const { data } = await axios.post(url, body, { headers });
        const places = (data?.places ?? []).slice(0, limit).map((p) => ({
            place_id: p.id,
            name: p.displayName?.text ?? '',
            address: p.formattedAddress ?? '',
            rating: p.rating ?? null,
            user_ratings_total: p.userRatingCount ?? 0
        }));
        res.json({ results: places });
    }
    catch (err) {
        console.error('[searchText v1] ERROR', err?.response?.data || err?.message);
        res.status(500).json({ error: err.message || 'searchText error' });
    }
});
/**
 * POST /api/enrichText
 * Body: { query: string, limit?: number }
 * Para cada lugar encontrado: detalles + scrape de emails
 */
app.post('/api/enrichText', async (req, res) => {
    try {
        const query = String(req.body?.query || '');
        const limit = Number(req.body?.limit || 20);
        if (!query)
            return res.status(400).json({ error: 'Missing query' });
        // 1) Buscar varios lugares
        const s = await axios.get('http://localhost:' + PORT + '/api/searchText', {
            params: { query, limit }
        });
        const items = s.data?.results || [];
        // 2) Para cada place_id, pedir detalles + emails
        const out = [];
        for (const it of items) {
            if (!it.place_id)
                continue;
            const det = await axios.get('http://localhost:' + PORT + '/api/details', {
                params: { place_id: it.place_id }
            });
            out.push({ query, ...det.data });
            await sleep(300);
        }
        res.json({ results: out });
    }
    catch (err) {
        console.error('[enrichText v1] ERROR', err?.response?.data || err?.message);
        res.status(500).json({ error: err.message || 'enrichText error' });
    }
});
app.use((req, res, next) => {
    if (req.path.startsWith('/api'))
        return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});
