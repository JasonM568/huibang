import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_BLOG_DB_ID!;

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  author: string;
  publishDate: string;
  coverImage?: string;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
}

// 取得所有已發布文章
export async function getBlogPosts(): Promise<BlogPost[]> {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "狀態",
      select: { equals: "已發布" },
    },
    sorts: [
      { property: "發布日期", direction: "descending" },
    ],
  });

  return response.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      slug: props["Slug"]?.rich_text?.[0]?.plain_text || page.id,
      title: props["標題"]?.title?.[0]?.plain_text || "無標題",
      category: props["分類"]?.select?.name || "未分類",
      summary: props["摘要"]?.rich_text?.[0]?.plain_text || "",
      author: props["作者"]?.rich_text?.[0]?.plain_text || "惠邦行銷",
      publishDate: props["發布日期"]?.date?.start || "",
      coverImage: props["封面圖"]?.files?.[0]?.file?.url || props["封面圖"]?.files?.[0]?.external?.url || undefined,
    };
  });
}

// 用 slug 取得單篇文章
export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "狀態", select: { equals: "已發布" } },
      ],
    },
  });

  if (response.results.length === 0) return null;

  const page = response.results[0] as any;
  const props = page.properties;

  // 取得頁面內容（blocks）
  const blocks = await getBlocks(page.id);
  const content = blocksToHtml(blocks);

  return {
    id: page.id,
    slug: props["Slug"]?.rich_text?.[0]?.plain_text || page.id,
    title: props["標題"]?.title?.[0]?.plain_text || "無標題",
    category: props["分類"]?.select?.name || "未分類",
    summary: props["摘要"]?.rich_text?.[0]?.plain_text || "",
    author: props["作者"]?.rich_text?.[0]?.plain_text || "惠邦行銷",
    publishDate: props["發布日期"]?.date?.start || "",
    coverImage: props["封面圖"]?.files?.[0]?.file?.url || props["封面圖"]?.files?.[0]?.external?.url || undefined,
    content,
  };
}

// 取得頁面所有 blocks
async function getBlocks(pageId: string) {
  const blocks: any[] = [];
  let cursor: string | undefined;

  do {
    const response: any = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return blocks;
}

// 把 rich_text 轉成 HTML
function richTextToHtml(richTexts: any[]): string {
  if (!richTexts) return "";
  return richTexts
    .map((t: any) => {
      let text = t.plain_text || "";
      // Escape HTML
      text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      if (t.annotations?.bold) text = `<strong>${text}</strong>`;
      if (t.annotations?.italic) text = `<em>${text}</em>`;
      if (t.annotations?.code) text = `<code>${text}</code>`;
      if (t.annotations?.strikethrough) text = `<s>${text}</s>`;
      if (t.href) text = `<a href="${t.href}" target="_blank" rel="noopener noreferrer" class="text-brand-500 underline hover:text-brand-600">${text}</a>`;

      return text;
    })
    .join("");
}

// 把 blocks 轉成 HTML
function blocksToHtml(blocks: any[]): string {
  let html = "";
  let inList: string | null = null;

  for (const block of blocks) {
    // 關閉前一個 list（如果類型改變）
    if (inList && block.type !== inList) {
      html += inList === "bulleted_list_item" ? "</ul>" : "</ol>";
      inList = null;
    }

    switch (block.type) {
      case "heading_1":
        html += `<h2 class="text-2xl font-bold mt-10 mb-4">${richTextToHtml(block.heading_1.rich_text)}</h2>`;
        break;
      case "heading_2":
        html += `<h3 class="text-xl font-bold mt-8 mb-3">${richTextToHtml(block.heading_2.rich_text)}</h3>`;
        break;
      case "heading_3":
        html += `<h4 class="text-lg font-semibold mt-6 mb-2">${richTextToHtml(block.heading_3.rich_text)}</h4>`;
        break;
      case "paragraph":
        const text = richTextToHtml(block.paragraph.rich_text);
        if (text) html += `<p class="mb-4 leading-relaxed">${text}</p>`;
        else html += `<div class="h-4"></div>`;
        break;
      case "bulleted_list_item":
        if (inList !== "bulleted_list_item") {
          html += `<ul class="list-disc list-inside space-y-2 mb-4 ml-4">`;
          inList = "bulleted_list_item";
        }
        html += `<li class="leading-relaxed">${richTextToHtml(block.bulleted_list_item.rich_text)}</li>`;
        break;
      case "numbered_list_item":
        if (inList !== "numbered_list_item") {
          html += `<ol class="list-decimal list-inside space-y-2 mb-4 ml-4">`;
          inList = "numbered_list_item";
        }
        html += `<li class="leading-relaxed">${richTextToHtml(block.numbered_list_item.rich_text)}</li>`;
        break;
      case "quote":
        html += `<blockquote class="border-l-4 border-brand-400 pl-4 italic text-dark-500 my-6">${richTextToHtml(block.quote.rich_text)}</blockquote>`;
        break;
      case "divider":
        html += `<hr class="my-8 border-dark-200" />`;
        break;
      case "image":
        const imgUrl = block.image?.file?.url || block.image?.external?.url || "";
        const caption = block.image?.caption?.[0]?.plain_text || "";
        html += `<figure class="my-6"><img src="${imgUrl}" alt="${caption}" class="rounded-xl w-full" />${caption ? `<figcaption class="text-center text-sm text-dark-400 mt-2">${caption}</figcaption>` : ""}</figure>`;
        break;
      case "code":
        html += `<pre class="bg-dark-100 rounded-xl p-4 overflow-x-auto my-6"><code>${richTextToHtml(block.code.rich_text)}</code></pre>`;
        break;
      default:
        break;
    }
  }

  // 關閉最後的 list
  if (inList) {
    html += inList === "bulleted_list_item" ? "</ul>" : "</ol>";
  }

  return html;
}
