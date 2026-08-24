import { APP_RELEASE } from './app-contract.mjs';
import { ASSET_RELEASE } from './asset-contract.mjs';

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function headerValue(vercel, source, key) {
  return vercel.headers
    ?.find(rule => rule.source === source)
    ?.headers?.find(header => header.key.toLowerCase() === key.toLowerCase())
    ?.value;
}

export function validateInfrastructureContract({ ci, serviceWorker, vercel, vercelIgnore }) {
  invariant(vercel?.buildCommand === 'npm run build', 'Vercel doit utiliser npm run build.');
  invariant(vercel?.outputDirectory === 'dist', 'Vercel doit publier uniquement dist.');
  invariant(vercel?.framework === null, 'Vercel doit rester en mode statique explicite.');

  const security = new Map((vercel.headers?.find(rule => rule.source === '/(.*)')?.headers || [])
    .map(header => [header.key.toLowerCase(), header.value]));
  for (const key of [
    'content-security-policy',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy',
    'origin-agent-cluster',
    'permissions-policy',
    'referrer-policy',
    'strict-transport-security',
    'x-content-type-options',
    'x-dns-prefetch-control',
    'x-frame-options',
    'x-permitted-cross-domain-policies',
  ]) {
    invariant(security.has(key), `En-tete de securite Vercel absent : ${key}.`);
  }
  invariant(security.get('x-content-type-options') === 'nosniff', 'nosniff requis.');
  invariant(security.get('x-frame-options') === 'DENY', 'Protection anti-frame requise.');
  invariant(security.get('content-security-policy').includes("default-src 'self'"), 'CSP same-origin requise.');

  for (const source of ['/', '/index.html', '/story.js', '/expansion-story.js', '/boss-roster.js', '/game.js', '/styles.css', '/manifest.webmanifest', '/sw.js']) {
    invariant(headerValue(vercel, source, 'Cache-Control') === 'public, max-age=0, must-revalidate', `Revalidation requise : ${source}.`);
  }
  invariant(headerValue(vercel, '/sw.js', 'Service-Worker-Allowed') === '/', 'Scope du service worker absent.');
  invariant(headerValue(vercel, '/pwa-update-v2.9.0.js', 'Cache-Control') === 'public, max-age=31536000, immutable', 'Bootstrap PWA versionne non immutable.');
  invariant(headerValue(vercel, `/assets/generated/v${ASSET_RELEASE}/(.*)`, 'Cache-Control') === 'public, max-age=31536000, immutable', 'Cache immutable assets absent.');

  invariant(serviceWorker.includes(`const APP_VERSION = '${APP_RELEASE}'`), 'Version application du service worker incoherente.');
  invariant(serviceWorker.includes(`const ASSET_VERSION = '${ASSET_RELEASE}'`), 'Version assets du service worker incoherente.');
  invariant(serviceWorker.includes('gearstorm-shell-v${APP_VERSION}'), 'Cache shell non versionne.');
  invariant(serviceWorker.includes('gearstorm-runtime-v${ASSET_VERSION}'), 'Cache runtime non versionne.');
  invariant(serviceWorker.includes('cacheFirstRuntime'), 'Strategie cache-first des WebP absente.');
  invariant(serviceWorker.includes('staleWhileRevalidateShell'), 'Strategie stale-while-revalidate du shell absente.');
  invariant(serviceWorker.includes('networkFirstNavigation'), 'Fallback navigation hors ligne absent.');
  invariant(serviceWorker.includes('canonicalRequest'), 'Normalisation des cles de cache absente.');
  invariant(serviceWorker.includes('CORE_PATHS.has(url.pathname)'), 'Le cache shell doit etre limite a la liste blanche.');
  const coreBlock = serviceWorker.slice(serviceWorker.indexOf('const CORE_ASSETS'), serviceWorker.indexOf('const CORE_PATHS'));
  invariant(coreBlock.includes("'./story.js'"), 'Le registre narratif doit faire partie du shell PWA.');
  invariant(coreBlock.includes("'./expansion-story.js'"), 'Le registre narratif Forge doit faire partie du shell PWA.');
  invariant(coreBlock.includes("'./boss-roster.js'"), 'Le roster des 30 boss doit faire partie du shell PWA.');
  invariant(coreBlock.includes("'./pwa-update-v2.9.0.js'"), 'Le bootstrap de migration PWA doit faire partie du shell.');
  invariant(coreBlock.includes(`assets/generated/v\${ASSET_VERSION}/asset-manifest.json`), 'Catalogue assets absent du shell PWA.');
  invariant(!/\.webp[\x60'"]/.test(coreBlock), 'Les WebP runtime ne doivent pas etre precaches.');
  const installBlock = serviceWorker.slice(serviceWorker.indexOf("self.addEventListener('install'"), serviceWorker.indexOf("self.addEventListener('activate'"));
  invariant(!installBlock.includes('skipWaiting'), 'Une mise a jour PWA ne doit pas etre activee sans consentement.');
  const messageBlock = serviceWorker.slice(serviceWorker.indexOf("self.addEventListener('message'"), serviceWorker.indexOf('function canonicalRequest'));
  invariant(messageBlock.includes('SKIP_WAITING') && messageBlock.includes('skipWaiting'), 'Activation PWA explicite absente.');

  const ignored = new Set(vercelIgnore.split(/\r?\n/).map(line => line.trim()).filter(Boolean));
  for (const pattern of [
    '.git/',
    '.github/',
    'tests/',
    'node_modules/',
    'dist/',
    '.env*',
    'qa-*.png',
    'server.js',
    'scripts/*.py',
    'assets/generated/arenas/',
    'assets/generated/bosses/',
    'assets/generated/riva/',
    'assets/generated/vfx/',
    'assets/generated/PROVENANCE.md',
    'assets/generated/**/*.png',
  ]) {
    invariant(ignored.has(pattern), `.vercelignore incomplet : ${pattern}.`);
  }
  invariant(!ignored.has(`assets/generated/v${ASSET_RELEASE}/`), 'Le runtime versionne ne doit pas etre ignore.');
  invariant(!ignored.has('assets/generated/'), 'Le catalogue runtime doit rester disponible au build.');

  for (const marker of [
    'runs-on: ubuntu-latest',
    'node-version: 22',
    'npm ci --ignore-scripts',
    'npm run qa',
    'npx playwright install --with-deps chromium',
    'npm run test:e2e',
    'npm audit --audit-level=high',
    'actions/checkout@v6',
    'actions/setup-node@v6',
    'actions/upload-artifact@v7',
    'persist-credentials: false',
    'contents: read',
  ]) {
    invariant(ci.includes(marker), `Contrat CI Linux absent : ${marker}.`);
  }
  invariant(ci.includes('name: gearstorm-web-v' + APP_RELEASE), 'Artefact CI non versionne sur la release application.');
  invariant(!ci.includes('pull_request_target'), 'pull_request_target est interdit pour cette CI.');
  invariant(!ci.includes('VERCEL_TOKEN'), 'La CI de validation ne doit pas exiger de secret de deploiement.');

  return { appRelease: APP_RELEASE, assetRelease: ASSET_RELEASE };
}
