#!/usr/bin/env node
/**
 * Simple sitemap generator.
 * - Scans static React Router paths.
 * - Adds dynamic report routes for existing recommendation files if backend results are available.
 * - Writes sitemap.xml into frontend/dist (after vite build) or public fallback.
 */
import { promises as fs } from 'fs';
import path from 'path';

const projectRoot = path.resolve(process.cwd(), '..'); // frontend/.. -> repo root
const frontendRoot = path.resolve(projectRoot, 'frontend');
const distDir = path.resolve(frontendRoot, 'dist');
const publicDir = path.resolve(frontendRoot, 'public');
const backendResultsDir = path.resolve(projectRoot, 'results'); // root level results (mounted)

// Base site URL (can be overridden by env SITE_URL)
const siteUrl = process.env.SITE_URL?.replace(/\/$/, '') || 'http://localhost:' + (process.env.FRONTEND_PORT || '8173');

// Static routes defined in App.tsx
const staticRoutes = ['/', '/results'];

function isoDate(date) {
  return date.toISOString();
}

async function collectDynamicReportRoutes() {
  const routes = [];
  try {
    const files = await fs.readdir(backendResultsDir);
    const now = new Date();
    for (const f of files) {
      if (f.startsWith('stock_recommendations_') && f.endsWith('.txt')) {
        // Generate a slug similar to generateSlug() (approximation without timestamp precision)
        const base = f.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
        routes.push({ loc: `/report/${base}`, lastmod: isoDate(now) });
      }
    }
  } catch (e) {
    // Silently ignore if results dir missing
  }
  return routes;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function generate() {
  const dynamicReports = await collectDynamicReportRoutes();
  const now = new Date();

  const urlEntries = [
    ...staticRoutes.map(r => ({ loc: r, lastmod: isoDate(now), priority: r === '/' ? '1.0' : '0.8' })),
    ...dynamicReports.map(r => ({ ...r, priority: '0.6' }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
urlEntries.map(u => `  <url>\n    <loc>${siteUrl}${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
`\n</urlset>\n`;

  // Prefer dist if it exists (post-build), else public (will be copied by Vite)
  const targetDir = (await fs.stat(distDir).then(() => distDir).catch(() => publicDir));
  await ensureDir(targetDir);
  const targetPath = path.join(targetDir, 'sitemap.xml');
  await fs.writeFile(targetPath, xml, 'utf8');
  console.log('Sitemap generated at', targetPath, 'with', urlEntries.length, 'URLs');
}

generate().catch(err => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
