import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const all = await getCollection('posts', ({ data }) => !data.draft);
  const posts = all.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: 'ccmux blog',
    description:
      'ccmux 의 내부 구조·설계 판단·기능 사용법을 기록하는 엔지니어 블로그.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/${post.id.replace(/\.mdx?$/, '')}/`,
      categories: post.data.tags,
    })),
    customData: '<language>ja-jp</language>',
  });
}
