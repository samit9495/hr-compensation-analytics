import { useQuery } from "@tanstack/react-query";

import { insightsApi } from "@/services/insights";
import type { OutlierBucket } from "@/services/types";

export function useOutliers(bucket: OutlierBucket, limit = 10) {
  return useQuery({
    queryKey: ["insights", "outliers", bucket, limit] as const,
    queryFn: () => insightsApi.outliers(bucket, limit),
  });
}
