const WP_BASE = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') ?? '';
const WP_API  = `${WP_BASE}/wp-json/wp/v2`;

// ── JWT Auth ───────────────────────────────────────────────────────────────────

let _cachedToken: string | null = null;
let _tokenExpires = 0;

/**
 * Obtiene (y cachea en memoria) un token JWT de WordPress.
 * El token se renueva 60 segundos antes de expirar.
 */
async function getWpToken(): Promise<string | null> {
  const user = process.env.WP_JWT_USER;
  const pass = process.env.WP_JWT_PASS;
  if (!user || !pass) return null;

  const now = Date.now();
  if (_cachedToken && now < _tokenExpires) return _cachedToken;

  try {
    const res = await fetch(`${WP_BASE}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[wordpress] JWT token error:', res.status);
      return null;
    }
    const data = await res.json();
    _cachedToken = data.token ?? null;
    // WordPress JWT expira en 7 días por defecto; cacheamos por 6 horas
    _tokenExpires = now + 6 * 60 * 60 * 1000;
    return _cachedToken;
  } catch (err) {
    console.error('[wordpress] JWT fetch error:', err);
    return null;
  }
}

async function wpHeaders(): Promise<HeadersInit> {
  const token = await getWpToken();
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface WPPost {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  categories: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

// ── Funciones públicas ─────────────────────────────────────────────────────────

export async function getPosts(params?: {
  perPage?: number;
  page?: number;
  categories?: number[];
  search?: string;
}): Promise<{ posts: WPPost[]; total: number; pages: number }> {
  const query = new URLSearchParams({
    _embed: 'wp:featuredmedia,wp:term',
    per_page: String(params?.perPage ?? 12),
    page: String(params?.page ?? 1),
    status: 'publish',
  });
  if (params?.categories?.length) query.set('categories', params.categories.join(','));
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${WP_API}/posts?${query}`, {
    headers: await wpHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return { posts: [], total: 0, pages: 0 };

  const posts: WPPost[] = await res.json();
  const total = parseInt(res.headers.get('X-WP-Total') ?? '0');
  const pages = parseInt(res.headers.get('X-WP-TotalPages') ?? '0');
  return { posts, total, pages };
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const res = await fetch(`${WP_API}/posts?slug=${slug}&_embed=wp:featuredmedia,wp:term`, {
    headers: await wpHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const posts: WPPost[] = await res.json();
  return posts[0] ?? null;
}

export async function getCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API}/categories?per_page=100&hide_empty=true`, {
    headers: await wpHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}

export function getPostImage(post: WPPost): string | null {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
}

export function getPostCategories(post: WPPost): Array<{ id: number; name: string; slug: string }> {
  return post._embedded?.['wp:term']?.[0] ?? [];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── Hero Slider ────────────────────────────────────────────────────────────────

export interface HeroSlide {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  label: string;
  ctaText: string;
  ctaUrl: string;
  note: string;
}

const HERO_FALLBACK: HeroSlide[] = [
  {
    id: 0,
    title: 'KIT DE <span class="text-primary italic">ARRASTRE</span> IMBRA —<br/>HECHO POR NOSOTROS, PARA TU MOTO',
    excerpt: 'No lo compramos a nadie. Lo fabricamos nosotros en Colombia. 50 años haciéndolo bien para que tu moto nunca pare.',
    image: '/images/hero-bg.png',
    label: '⚡ DIRECTO DEL FABRICANTE',
    ctaText: 'VER KIT Y PRECIO',
    ctaUrl: '/tienda',
    note: 'VÁLIDO HASTA EL 31/12/2025',
  },
];

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    // Endpoint propio en WP que lee directamente la carpeta Filebird (folder_id=7)
    const res = await fetch(
      `${WP_BASE}/wp-json/imbra/v1/slider`,
      { cache: 'no-store' }
    );
    if (!res.ok) return HERO_FALLBACK;

    const items: Array<{
      id: number;
      title: string;
      caption: string;
      description: string;
      alt_text: string;
      source_url: string;
    }> = await res.json();

    if (!items.length) return HERO_FALLBACK;

    // Convención de campos en WordPress Medios:
    //   Texto alternativo → etiqueta naranja (ej. "⚡ DIRECTO DEL FABRICANTE")
    //   Leyenda (title)   → subtítulo del slide
    //   Descripción       → 3 líneas: título principal / texto botón / url
    //   Imagen            → fondo del slide
    const slides: HeroSlide[] = items.map((m, idx) => {
      const lines = (m.description ?? '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      // La URL siempre es la última línea (empieza con /)
      // El texto del botón es la penúltima
      // Todo lo anterior es el título
      const urlLine     = lines.findLast((l) => l.startsWith('/')) ?? '/tienda';
      const remaining   = lines.filter((l) => l !== urlLine);
      const ctaText     = remaining.pop() ?? 'VER MÁS';
      const title       = remaining.join(' ') || ctaText;
      return {
        id:      m.id ?? idx,
        title,
        excerpt: m.title ?? '',
        image:   m.source_url ?? '/images/hero-bg.png',
        label:   m.alt_text ?? '',
        ctaText,
        ctaUrl: urlLine,
        note:    '',
      };
    });

    return slides;
  } catch {
    return HERO_FALLBACK;
  }
}
