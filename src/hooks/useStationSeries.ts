import { useEffect, useState } from 'react';
import type { ApiResponse, Measurement } from '@/types';

export interface StationSeriesState {
  series: Measurement[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: StationSeriesState = {
  series: [],
  loading: false,
  error: null,
};

export function useStationSeries(
  stationId: string | null,
  pageSize = 24,
): StationSeriesState {
  const [state, setState] = useState<StationSeriesState>(INITIAL_STATE);

  useEffect(() => {
    if (!stationId) {
      setState(INITIAL_STATE);
      return;
    }
    const controller = new AbortController();
    setState({ series: [], loading: true, error: null });

    fetch(
      `/api/stations/${stationId}/measurements?pageSize=${pageSize}&sortDir=asc`,
      { signal: controller.signal },
    )
      .then((r) => r.json() as Promise<ApiResponse<Measurement[]>>)
      .then((body) => {
        if (controller.signal.aborted) return;
        if (body.ok) {
          setState({ series: body.data, loading: false, error: null });
        } else {
          setState({ series: [], loading: false, error: body.error.message });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : 'Помилка мережі';
        setState({ series: [], loading: false, error: message });
      });

    return () => controller.abort();
  }, [stationId, pageSize]);

  return state;
}
