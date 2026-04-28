export type AnalyticsEventName =
  | 'page_view'
  | 'page_load_timing'
  | 'session_start'
  | 'session_end'
  | 'station_detail_viewed'
  | 'map_station_selected'
  | 'map_zoom_changed'
  | 'chart_filter_toggled'
  | 'compare_pollutant_changed'
  | 'data_exported'
  | 'error_boundary_triggered';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  props?: Record<string, string | number | boolean | null>;
  sessionId: string;
  path: string;
  ts: string;
}
