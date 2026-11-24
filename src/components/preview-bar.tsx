export function PreviewBar({
  slug,
  label,
  exitLabel,
}: {
  slug: string;
  label: string;
  exitLabel: string;
}) {
  return (
    <aside
      role="status"
      className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-4 rounded-[24px] bg-invert py-2 pl-4 pr-2 text-invert-ink shadow-pill"
    >
      <span className="t-micro">{label}</span>
      <form method="post" action={`/preview/exit/?slug=${encodeURIComponent(slug)}`}>
        <button
          type="submit"
          className="t-micro min-h-8 cursor-pointer whitespace-nowrap rounded-[24px] bg-surface px-3 py-1.5 text-ink transition-opacity duration-300 hover:opacity-80"
        >
          {exitLabel}
        </button>
      </form>
    </aside>
  );
}
