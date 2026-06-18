import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Feed } from 'feed';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const updatesPath = path.join(rootDir, 'data', 'updates.json');
const outputPath = path.join(rootDir, 'feed.xml');
const siteUrl = String(process.env.METRIQ_SITE_URL ?? 'https://metriq.info').trim().replace(/\/+$/, '') || 'https://metriq.info';
const faviconUrl = `${siteUrl}/public/favicon.ico`;
const INVALID_DATE_FALLBACK_TIME = 0;
const asText = (value) => String(value ?? '').trim();
const sanitizeFileStem = (input) => input
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9._-]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');
const stableHash = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash * 31) + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
};
const buildFallbackUpdateId = (item, index) => {
  const date = asText(item?.date);
  const title = asText(item?.title);
  const href = asText(item?.href);
  const body = asText(item?.body);
  const signature = [date, title, href, body].filter(Boolean).join('|');
  const stem = sanitizeFileStem([date, title].filter(Boolean).join('-')).slice(0, 64);
  const hash = stableHash(signature || `update-${index + 1}`);
  return `${stem || 'update'}-${hash}`;
};
const asDate = (value) => {
  const text = asText(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(`${text}T00:00:00Z`) : new Date(text);
  if (Number.isNaN(Number(date))) {
    console.warn(`Invalid update date "${text || '<empty>'}" in ${updatesPath}; using Unix epoch fallback.`);
    return new Date(INVALID_DATE_FALLBACK_TIME);
  }
  return date;
};

const parsed = JSON.parse(readFileSync(updatesPath, 'utf8'));
if (!Array.isArray(parsed)) {
  throw new Error('data/updates.json must contain a JSON array');
}

const usedUpdateIds = new Set();
const updates = parsed
  .map((item, index) => {
    const explicitId = asText(item?.id);
    const baseId = explicitId || buildFallbackUpdateId(item, index);
    let uniqueId = baseId;
    let duplicateCounter = 2;
    while (usedUpdateIds.has(uniqueId)) {
      uniqueId = `${baseId}-${duplicateCounter}`;
      duplicateCounter += 1;
    }
    usedUpdateIds.add(uniqueId);
    return {
      id: uniqueId,
      date: asText(item?.date),
      title: asText(item?.title),
      body: asText(item?.body),
      href: asText(item?.href),
      linkText: asText(item?.linkText),
    };
  })
  .filter((item) => item.title || item.body)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

const feed = new Feed({
  title: 'Metriq Updates',
  description: 'Latest news and product updates from Metriq.',
  id: `${siteUrl}/`,
  link: `${siteUrl}/`,
  language: 'en-us',
  image: faviconUrl,
  favicon: faviconUrl,
  updated: updates[0] ? asDate(updates[0].date) : new Date(),
  feedLinks: { rss2: `${siteUrl}/feed.xml` },
});

for (const update of updates) {
  const itemUrl = `${siteUrl}/#update=${encodeURIComponent(update.id)}`;
  feed.addItem({
    title: update.title || update.body || 'Metriq update',
    id: itemUrl,
    link: itemUrl,
    description: [update.body, update.href ? `${update.linkText || 'More'}: ${update.href}` : ''].filter(Boolean).join('\n\n'),
    date: asDate(update.date),
  });
}

writeFileSync(outputPath, feed.rss2(), 'utf8');
console.log(`Generated ${outputPath} with ${updates.length} item(s).`);
