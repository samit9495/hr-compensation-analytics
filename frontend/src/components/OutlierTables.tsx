import { useOutliers } from "@/hooks/useOutliers";
import type { OutlierBucket, OutlierEntry } from "@/services/types";

const BUCKET_LABEL: Record<OutlierBucket, string> = {
  bottom: "Bottom 5% — retention risk",
  top: "Top 5% — budget review",
};

const BUCKET_DESCRIPTION: Record<OutlierBucket, string> = {
  bottom: "Lowest compensated peers within their (country, role) group.",
  top: "Highest compensated peers within their (country, role) group.",
};

type OutlierColumnProps = {
  bucket: OutlierBucket;
};

function OutlierColumn({ bucket }: OutlierColumnProps) {
  const query = useOutliers(bucket, 10);

  return (
    <section className="space-y-2">
      <header>
        <h3 className="text-base font-semibold text-slate-800">{BUCKET_LABEL[bucket]}</h3>
        <p className="text-xs text-slate-500">{BUCKET_DESCRIPTION[bucket]}</p>
      </header>
      {query.isLoading ? (
        <p role="status" className="text-sm text-slate-500">
          Loading…
        </p>
      ) : query.isError ? (
        <p role="alert" className="text-sm text-red-700">
          Failed to load outliers.
        </p>
      ) : query.data && query.data.entries.length > 0 ? (
        <OutlierTable rows={query.data.entries} />
      ) : (
        <p
          role="status"
          className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500"
        >
          No peer groups large enough to flag.
        </p>
      )}
    </section>
  );
}

function OutlierTable({ rows }: { rows: OutlierEntry[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <table className="w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              Employee
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Role
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Country
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Salary
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-3 py-2 font-medium text-slate-900">{row.full_name}</td>
              <td className="px-3 py-2 text-slate-700">{row.job_title}</td>
              <td className="px-3 py-2 text-slate-700">{row.country}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                {Number(row.salary).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OutlierTables() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <OutlierColumn bucket="bottom" />
      <OutlierColumn bucket="top" />
    </div>
  );
}
