import type { ReactNode } from "react";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";
import { isExternalHref, safeHref } from "@/lib/safe-url";

type ListKind = "ul" | "ol";

type SubList = {
  kind: ListKind;
  items: string[];
};

type ListItem = {
  text: string;
  subLists: SubList[];
};

type ListState = {
  kind: ListKind;
  items: ListItem[];
};

type CodeFenceState = {
  lang: string;
  lines: string[];
};

type ParsedImage = {
  alt: string;
  rawSrc: string;
  caption?: string;
};

function findClosingBracket(text: string, openIndex: number): number {
  for (let i = openIndex + 1; i < text.length; i += 1) {
    if (text[i] === "`") {
      const endCode = text.indexOf("`", i + 1);
      if (endCode !== -1) {
        i = endCode;
        continue;
      }
    }
    if (text[i] === "]") return i;
  }
  return -1;
}

function findBalancedParen(text: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < text.length; i += 1) {
    if (text[i] === "(") {
      depth += 1;
    } else if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseImageInner(inner: string): { rawSrc: string; caption?: string } {
  const trimmed = inner.trim();
  const match = trimmed.match(/^(.+?)\s+"([^"]*)"$/);
  if (match) {
    return { rawSrc: match[1].trim(), caption: match[2] };
  }
  return { rawSrc: trimmed };
}

function parseStandaloneImage(trimmed: string): ParsedImage | null {
  if (!trimmed.startsWith("![") || !trimmed.endsWith(")")) return null;
  const closeBracket = trimmed.indexOf("]", 2);
  if (closeBracket === -1 || trimmed[closeBracket + 1] !== "(") return null;
  const closeParen = findBalancedParen(trimmed, closeBracket + 1);
  if (closeParen !== trimmed.length - 1) return null;

  const alt = trimmed.slice(2, closeBracket);
  const inner = trimmed.slice(closeBracket + 2, closeParen);
  return { alt, ...parseImageInner(inner) };
}

function inline(text: string, keyPrefix: string, allowLinks = true): ReactNode[] {
  const out: ReactNode[] = [];
  let buf = "";
  let i = 0;
  let part = 0;

  const flushText = () => {
    if (buf) {
      out.push(buf);
      buf = "";
    }
  };

  while (i < text.length) {
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > i + 1) {
        flushText();
        out.push(
          <code
            key={`${keyPrefix}-c${part++}`}
            className="rounded-[6px] border border-line bg-surface-muted px-1.5 py-0.5 font-mono t-body-sm text-ink break-words"
          >
            {text.slice(i + 1, end)}
          </code>,
        );
        i = end + 1;
        continue;
      }
    }

    if (text[i] === "!" && text[i + 1] === "[") {
      const closeBracket = text.indexOf("]", i + 2);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = findBalancedParen(text, closeBracket + 1);
        if (closeParen !== -1) {
          const alt = text.slice(i + 2, closeBracket);
          const { rawSrc } = parseImageInner(text.slice(closeBracket + 2, closeParen));
          const safeSrc = safeHref(rawSrc);
          if (safeSrc) {
            flushText();
            out.push(
              <MaybeImg
                key={`${keyPrefix}-img${part++}`}
                src={safeSrc}
                alt={alt}
                loading="lazy"
                className="inline-block max-w-full rounded-[16px]"
              />,
            );
          } else if (alt) {
            buf += alt;
          }
          i = closeParen + 1;
          continue;
        }
      }
    }

    if (allowLinks && text[i] === "[") {
      const closeBracket = findClosingBracket(text, i);
      if (closeBracket > i + 1 && text[closeBracket + 1] === "(") {
        const closeParen = findBalancedParen(text, closeBracket + 1);
        if (closeParen !== -1) {
          const label = text.slice(i + 1, closeBracket);
          const rawUrl = text.slice(closeBracket + 2, closeParen);
          const href = safeHref(rawUrl);
          const idx = part++;
          const labelNodes = inline(label, `${keyPrefix}-l${idx}`, false);
          flushText();
          if (href) {
            const external = isExternalHref(href);
            out.push(
              <a
                key={`${keyPrefix}-a${idx}`}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="underline decoration-ink-3 underline-offset-4 transition-opacity hover:opacity-70"
              >
                {labelNodes}
              </a>,
            );
          } else {
            out.push(...labelNodes);
          }
          i = closeParen + 1;
          continue;
        }
      }
    }

    if (text[i] === "*" && text[i + 1] === "*") {
      let end = text.indexOf("**", i + 2);
      if (end > i + 2) {
        if (text[end + 2] === "*") end += 1;
        flushText();
        const idx = part++;
        out.push(
          <strong key={`${keyPrefix}-b${idx}`} className="font-semibold">
            {inline(text.slice(i + 2, end), `${keyPrefix}-b${idx}`, allowLinks)}
          </strong>,
        );
        i = end + 2;
        continue;
      }
    }

    if (text[i] === "*") {
      const end = text.indexOf("*", i + 1);
      if (end > i + 1) {
        flushText();
        const idx = part++;
        out.push(
          <em key={`${keyPrefix}-i${idx}`}>
            {inline(text.slice(i + 1, end), `${keyPrefix}-i${idx}`, allowLinks)}
          </em>,
        );
        i = end + 1;
        continue;
      }
    }

    buf += text[i];
    i += 1;
  }

  flushText();
  return out;
}

/**
 * Dependency-free markdown renderer for articles: headings (`##`/`###`),
 * paragraphs, blockquotes, unordered/ordered lists (one nesting level),
 * fenced code blocks, captioned lazy images, horizontal rules, and inline
 * code, links, bold, and italic. All HTML escaping is delegated to React.
 */
export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: ListState | null = null;
  let codeFence: CodeFenceState | null = null;
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) {
      const id = key++;
      blocks.push(
        <p key={`p${id}`} className="t-body">
          {inline(text, `p${id}`)}
        </p>,
      );
    }
    paragraph = [];
  };

  const flushQuote = () => {
    if (quote.length === 0) return;
    const id = key++;
    blocks.push(
      <blockquote
        key={`q${id}`}
        className="my-2 border-l-2 border-ink pl-6"
      >
        <p className="t-h4">{inline(quote.join(" ").trim(), `q${id}`)}</p>
      </blockquote>,
    );
    quote = [];
  };

  const flushList = () => {
    if (!list || list.items.length === 0) {
      list = null;
      return;
    }
    const id = key++;
    const Tag = list.kind;
    const listClass =
      list.kind === "ul"
        ? "t-body flex list-disc flex-col gap-2 pl-6"
        : "t-body flex list-decimal flex-col gap-2 pl-6";

    blocks.push(
      <Tag key={`l${id}`} className={listClass}>
        {list.items.map((item, itemIndex) => (
          <li key={`l${id}-${itemIndex}`}>
            {inline(item.text, `l${id}-${itemIndex}`)}
            {item.subLists.map((sub, subIndex) => {
              const SubTag = sub.kind;
              const subClass =
                sub.kind === "ul"
                  ? "mt-2 flex list-disc flex-col gap-1.5 pl-6"
                  : "mt-2 flex list-decimal flex-col gap-1.5 pl-6";
              return (
                <SubTag key={`l${id}-${itemIndex}-s${subIndex}`} className={subClass}>
                  {sub.items.map((subItem, subItemIndex) => (
                    <li key={`l${id}-${itemIndex}-s${subIndex}-${subItemIndex}`}>
                      {inline(subItem, `l${id}-${itemIndex}-s${subIndex}-${subItemIndex}`)}
                    </li>
                  ))}
                </SubTag>
              );
            })}
          </li>
        ))}
      </Tag>,
    );
    list = null;
  };

  const flushCode = () => {
    if (!codeFence) return;
    const id = key++;
    const { lang, lines: codeLines } = codeFence;
    blocks.push(
      <div
        key={`code${id}`}
        className="min-w-0 max-w-full overflow-hidden rounded-[16px] border border-line bg-surface-muted"
      >
        {lang ? (
          <div className="border-b border-line px-4 py-2 font-mono t-micro text-ink-2">
            {lang}
          </div>
        ) : null}
        <pre className="min-w-0 max-w-full overflow-x-auto p-4 font-mono t-body-sm text-ink">
          <code className="font-mono">{codeLines.join("\n")}</code>
        </pre>
      </div>,
    );
    codeFence = null;
  };

  const flushTextBlocks = () => {
    flushParagraph();
    flushQuote();
    flushList();
  };

  const pushListItem = (kind: ListKind, text: string, nested: boolean) => {
    if (nested && list && list.items.length > 0) {
      const parent = list.items[list.items.length - 1];
      const lastSub = parent.subLists[parent.subLists.length - 1];
      if (lastSub && lastSub.kind === kind) {
        lastSub.items.push(text);
      } else {
        parent.subLists.push({ kind, items: [text] });
      }
      return;
    }

    flushParagraph();
    flushQuote();
    if (list && list.kind !== kind) flushList();
    if (!list) list = { kind, items: [] };
    list.items.push({ text, subLists: [] });
  };

  for (const raw of lines) {
    if (codeFence) {
      if (/^```\s*$/.test(raw)) {
        flushCode();
      } else {
        codeFence.lines.push(raw);
      }
      continue;
    }

    const fenceOpen = raw.match(/^```([^\s`]*)\s*$/);
    if (fenceOpen) {
      flushTextBlocks();
      codeFence = { lang: fenceOpen[1] ?? "", lines: [] };
      continue;
    }

    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      flushTextBlocks();
      continue;
    }

    if (line.startsWith("### ")) {
      flushTextBlocks();
      const id = key++;
      blocks.push(
        <h3 key={`h3${id}`} className="t-h4 mt-6">
          {inline(line.slice(4), `h3${id}`)}
        </h3>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushTextBlocks();
      const id = key++;
      blocks.push(
        <h2 key={`h2${id}`} className="t-h3 mt-8">
          {inline(line.slice(3), `h2${id}`)}
        </h2>,
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushTextBlocks();
      continue;
    }

    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushTextBlocks();
      blocks.push(<hr key={`hr${key++}`} className="border-line" />);
      continue;
    }

    if (line.startsWith(">")) {
      flushParagraph();
      flushList();
      const rest = line.replace(/^>\s?/, "");
      if (rest.trim() === "") {
        flushQuote();
      } else {
        quote.push(rest);
      }
      continue;
    }

    const standaloneImg = parseStandaloneImage(trimmed);
    if (standaloneImg) {
      flushTextBlocks();
      const safeSrc = safeHref(standaloneImg.rawSrc);
      if (safeSrc) {
        const id = key++;
        blocks.push(
          <figure key={`fig${id}`} className="flex flex-col gap-2">
            <div className={`overflow-hidden rounded-[16px]${emptyFrame(safeSrc)}`}>
              <MaybeImg
                src={safeSrc}
                alt={standaloneImg.alt}
                loading="lazy"
                className="h-auto w-full object-cover"
              />
            </div>
            {standaloneImg.caption ? (
              <figcaption className="t-body-sm text-ink-2">
                {inline(standaloneImg.caption, `cap${id}`)}
              </figcaption>
            ) : null}
          </figure>,
        );
      } else if (standaloneImg.alt) {
        blocks.push(
          <p key={`p${key++}`} className="t-body">
            {standaloneImg.alt}
          </p>,
        );
      }
      continue;
    }

    const nestedUl = line.match(/^(?: {2,}|\t+)[-*]\s+(.+)$/);
    if (nestedUl) {
      pushListItem("ul", nestedUl[1], true);
      continue;
    }

    const nestedOl = line.match(/^(?: {2,}|\t+)\d+\.\s+(.+)$/);
    if (nestedOl) {
      pushListItem("ol", nestedOl[1], true);
      continue;
    }

    const topUl = line.match(/^[-*]\s+(.+)$/);
    if (topUl) {
      pushListItem("ul", topUl[1], false);
      continue;
    }

    const topOl = line.match(/^\d+\.\s+(.+)$/);
    if (topOl) {
      pushListItem("ol", topOl[1], false);
      continue;
    }

    flushQuote();
    flushList();
    paragraph.push(line);
  }

  flushCode();
  flushTextBlocks();

  return <div className="flex min-w-0 max-w-full flex-col gap-6">{blocks}</div>;
}
