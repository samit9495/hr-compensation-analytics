type Props = {
  offset: number;
  limit: number;
  total?: number;
  isLastPage?: boolean;
  onChange: (next: { offset: number; limit: number }) => void;
};

export function Pagination({ offset, limit, total, isLastPage, onChange }: Props) {
  const start = total === 0 ? 0 : offset + 1;
  const end = total !== undefined ? Math.min(offset + limit, total) : offset + limit;

  const summary =
    total !== undefined ? `Showing ${start}\u2013${end} of ${total}` : `Showing ${start}\u2013${end}`;

  const reachedEnd =
    total !== undefined ? offset + limit >= total : Boolean(isLastPage);

  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span aria-live="polite">{summary}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 disabled:opacity-40"
          disabled={offset === 0}
          onClick={() => onChange({ offset: Math.max(0, offset - limit), limit })}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 disabled:opacity-40"
          disabled={reachedEnd}
          onClick={() => onChange({ offset: offset + limit, limit })}
        >
          Next
        </button>
      </div>
    </div>
  );
}
