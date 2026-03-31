import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/ui/PageHero";
import { getPostBySlug, getPostImage, getPostCategories, formatDate } from "@/lib/wordpress";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const image = getPostImage(post);
  const categories = getPostCategories(post).filter((c) => c.slug !== "sin-categoria");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow pt-0 pb-20">
        <PageHero
          label={categories.length > 0 ? categories.map(c => c.name).join(" · ") : "Blog"}
          title={post.title.rendered.replace(/<[^>]+>/g, "")}
          subtitle={formatDate(post.date)}
        />

        <div className="px-5 pt-10">
          <div className="max-w-3xl mx-auto">
            {/* Imagen destacada */}
            {image && (
              <div className="relative aspect-video w-full overflow-hidden mb-10">
                <Image
                  src={image}
                  alt={post.title.rendered}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              </div>
            )}

            {/* Contenido */}
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed
                prose-headings:font-black prose-headings:text-secondary prose-headings:uppercase
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-secondary prose-img:rounded-none"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* Volver al blog */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors"
              >
                <span className="material-icons text-sm">arrow_back</span>
                Volver al Blog
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
