import { BlogList } from "@/components/blog-list";
import { getPosts, getSiteSettings } from "@/lib/content";
import { latestPosts } from "@/lib/select";

export const revalidate = 3600;

export default async function BlogPage() {
  const [allPosts, settings] = await Promise.all([getPosts(), getSiteSettings()]);
  const posts = latestPosts(allPosts, 6);

  return (
    <>
      <section className="flex w-full flex-col items-center pt-36">
        <div className="container-1080 flex flex-col items-center gap-6 text-center">
          <h1
            className="max-w-[580px] font-medium"
            style={{ fontSize: 48, lineHeight: "52.8px", letterSpacing: "-1.44px" }}
          >
            {settings.copy.blog.title}
          </h1>
          <p className="t-body-lg max-w-[580px] text-ink-2">{settings.copy.blog.intro}</p>
        </div>
      </section>

      <BlogList posts={posts} author={settings.name} empty={settings.copy.blog.empty} />
    </>
  );
}
