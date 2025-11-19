import axios from 'axios';
export async function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}
export async function scrapeEmailsFromWebsite(url, maxBytes = 300000) {
    try {
        const res = await axios.get(url, {
            maxContentLength: maxBytes,
            timeout: 12000,
            // A veces los sitios bloquean sin user agent
            headers: { 'User-Agent': 'Mozilla/5.0 (LeadBot/1.0)' },
            validateStatus: () => true
        });
        const html = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        const emails = (html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])
            .map(e => e.trim().toLowerCase());
        const blacklist = ['google', 'cloudflare', 'shopify', 'wix', 'wordpress', 'mailchimp', 'hubspot', 'zendesk', 'zoho'];
        const unique = Array.from(new Set(emails)).filter(e => !blacklist.some(b => e.includes(b)));
        return unique.slice(0, 10);
    }
    catch {
        return [];
    }
}
