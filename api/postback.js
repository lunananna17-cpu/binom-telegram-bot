/**
 * api/postback.js
 *
 * Це serverless-функція для Vercel.
 * Вона "прокидається" рівно тоді, коли Binom надсилає постбек,
 * пересилає повідомлення в Telegram і "засинає" знову.
 * Вам не треба орендувати сервер — Vercel сам все запускає.
 */

export default async function handler(req, res) {
    try {
        const {
            source = 'WebBunny',
            campaign = '-',
            offer = '-',
            geo = '-',
            revenue = '-',
            sub1 = '-',
            sub2 = '-',
            sub3 = '-',
            cap_current = '-',
            cap_limit = '-',
            cap_expire = '-',
            status = '-',
        } = req.query;

        // Ці два значення ми заховаємо в "Environment Variables" на Vercel
        // (пояснення нижче в інструкції) — в коді їх не пишемо!
        const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
        const TELEGRAM_CHATID = process.env.TELEGRAM_CHATID;

        // Перетворюємо код країни (напр. "TR") на прапор-емодзі
        const geoToFlag = (code) => {
            if (!code || code.length !== 2) return '';
            return String.fromCodePoint(
                ...[...code.toUpperCase()].map(c => 0x1F1E6 + (c.charCodeAt(0) - 65))
            );
        };

        const now = new Date();
        const date = now.toLocaleDateString('uk-UA');
        const time = now.toLocaleTimeString('uk-UA');

        const text =
            `🕐 ${date} 🕰 ${time}\n` +
            `<b>${source}</b>\n` +
            `Campaign Name: ${campaign}\n` +
            `ID ${offer}\n` +
            `GEO: ${geo} ${geoToFlag(geo)}\n` +
            `Revenue: $${revenue}\n` +
            `Status: ${status}\n` +
            `🔗 Sub ID 1: ${sub1}\n` +
            `🔗 Sub ID 2: ${sub2}\n` +
            `🔗 Sub ID: ${sub3}\n` +
            `♻️ CAP: ${cap_current}/${cap_limit} month | ${cap_expire}`;

        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHATID,
                    text,
                    parse_mode: 'HTML',
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error('Telegram error:', errText);
            return res.status(500).send('Telegram error');
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error('Postback error:', err.message);
        res.status(500).send('ERROR');
    }
}
