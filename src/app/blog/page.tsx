import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/ui/PageHero";
import { getPosts, getCategories, getPostImage, getPostCategories, formatDate } from "@/lib/wordpress";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 3600;

interface PageProps {
  searchParams: { cat?: string; page?: string };
}

export default async function BlogPage({ searchParams }: PageProps) {
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;

  const [categoriesData, { posts, total, pages }] = await Promise.all([
    getCategories(),
    getPosts({
      perPage: 9,
      page: currentPage,
      categories: searchParams.cat ? [parseInt(searchParams.cat)] : undefined,
    }),
  ]);

  const activeCategory = categoriesData.find((c) => String(c.id) === searchParams.cat);

  // Excluir "Sin categoría"
  const categories = categoriesData.filter((c) => c.slug !== "sin-categoria" && c.count > 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <Header />

      <main className="flex-grow pt-0 pb-20">
        <PageHero
          label="Noticias y Artículos"
          title={activeCategory ? activeCategory.name : "Blog"}
          titleAccent="IMBRA"
          subtitle={`${total} artículo${total !== 1 ? "s" : ""} publicado${total !== 1 ? "s" : ""}`}
          badge={String(total)}
          badgeLabel="Artículos"
        />

        <div className="px-4 md:px-[60px] lg:px-[100px] pt-10">
          {/* Filtros de categoría */}
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/blog"
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border transition-colors ${
                !searchParams.cat
                  ? "bg-secondary text-white border-secondary"
                  : "border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary"
              }`}
            >
              Todos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?cat=${cat.id}`}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border transition-colors ${
                  String(cat.id) === searchParams.cat
                    ? "bg-secondary text-white border-secondary"
                    : "border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Grid de artículos */}
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => {
                  const image = getPostImage(post);
                  const postCats = getPostCategories(post);
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Imagen */}
                      <div className="relative aspect-video overflow-hidden bg-gray-100">
                        {image ? (
                          <Image
                            src={image}
                            alt={post.title.rendered}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-icons text-5xl text-gray-200">article</span>
                          </div>
                        )}
                        {postCats[0] && postCats[0].slug !== "sin-categoria" && (
                          <span className="absolute top-3 left-3 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">
                            {postCats[0].name}
                          </span>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="p-5 flex flex-col flex-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                          {formatDate(post.date)}
                        </p>
                        <h2
                          className="font-black text-secondary uppercase tracking-tight text-sm leading-snug mb-3 line-clamp-3 group-hover:text-primary transition-colors"
                          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                        <div
                          className="text-xs text-gray-400 line-clamp-2 mt-auto"
                          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                        />
                        <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest">
                          Leer más <span className="material-icons text-sm">arrow_forward</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Paginación */}
              {pages > 1 && (
                <div className="flex justify-center gap-1 mt-12">
                  {currentPage > 1 && (
                    <Link
                      href={`/blog?${searchParams.cat ? `cat=${searchParams.cat}&` : ""}page=${currentPage - 1}`}
                      className="px-4 py-2 border border-gray-200 text-sm font-bold text-secondary hover:border-secondary transition-colors"
                    >
                      ‹ Anterior
                    </Link>
                  )}
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/blog?${searchParams.cat ? `cat=${searchParams.cat}&` : ""}page=${p}`}
                      className={`px-4 py-2 border text-sm font-bold transition-colors ${
                        p === currentPage
                          ? "bg-secondary text-white border-secondary"
                          : "border-gray-200 text-secondary hover:border-secondary"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                  {currentPage < pages && (
                    <Link
                      href={`/blog?${searchParams.cat ? `cat=${searchParams.cat}&` : ""}page=${currentPage + 1}`}
                      className="px-4 py-2 border border-gray-200 text-sm font-bold text-secondary hover:border-secondary transition-colors"
                    >
                      Siguiente ›
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center">
              <span className="material-icons text-6xl text-gray-200 block mb-4">article</span>
              <p className="text-secondary font-bold text-lg">Sin artículos</p>
              <p className="text-gray-400 text-sm mt-1">No hay publicaciones en esta categoría.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
