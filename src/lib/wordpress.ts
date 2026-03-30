const WP_API = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') + '/wp-json/wp/v2';

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

  const res = await fetch(`${WP_API}/posts?${query}`, { next: { revalidate: 3600 } });
  if (!res.ok) return { posts: [], total: 0, pages: 0 };

  const posts: WPPost[] = await res.json();
  const total = parseInt(res.headers.get('X-WP-Total') ?? '0');
  const pages = parseInt(res.headers.get('X-WP-TotalPages') ?? '0');
  return { posts, total, pages };
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const res = await fetch(`${WP_API}/posts?slug=${slug}&_embed=wp:featuredmedia,wp:term`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const posts: WPPost[] = await res.json();
  return posts[0] ?? null;
}

export async function getCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API}/categories?per_page=100&hide_empty=true`, {
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
    const res = await fetch(
      `${WP_API}/hero_slide?orderby=menu_order&order=asc&_embed=wp:featuredmedia&per_page=10&status=publish`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return HERO_FALLBACK;
    const raw: Array<{
      id: number;
      title: { rendered: string };
      excerpt: { rendered: string };
      meta: { slide_label?: string; slide_cta_text?: string; slide_cta_url?: string; slide_note?: string };
      _embedded?: { 'wp:featuredmedia'?: Array<{ source_url: string }> };
    }> = await res.json();
    if (!raw.length) return HERO_FALLBACK;
    return raw.map((p) => ({
      id: p.id,
      title: p.title.rendered,
      excerpt: p.excerpt.rendered.replace(/<\/?p>/g, '').trim(),
      image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '/images/hero-bg.png',
      label: p.meta?.slide_label ?? '',
      ctaText: p.meta?.slide_cta_text ?? 'VER MÁS',
      ctaUrl: p.meta?.slide_cta_url ?? '/tienda',
      note: p.meta?.slide_note ?? '',
    }));
  } catch {
    return HERO_FALLBACK;
  }
}
