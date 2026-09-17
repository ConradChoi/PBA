// GA4 event names from spec section 21. Call sites are added as each
// screen is built:
//   radar_landing_view    -> wired on the landing page (src/app/page.tsx)
//   radar_start           -> pending: /diagnose start action
//   radar_layer_complete  -> pending: per-layer question screen
//   radar_complete        -> pending: last question submitted
//   radar_result_view     -> pending: result page
//   radar_pdf_request     -> pending: Phase 2 PDF download button
//   radar_consulting_click -> pending: result page CTA
//   radar_consulting_submit -> pending: consulting form submit
export type AnalyticsEventName =
  | "radar_landing_view"
  | "radar_start"
  | "radar_layer_complete"
  | "radar_complete"
  | "radar_result_view"
  | "radar_pdf_request"
  | "radar_consulting_click"
  | "radar_consulting_submit";
