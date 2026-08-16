import { bootstrapFeedbackWidget, initFeedbackWidget } from "./bootstrap";

export type { FeedbackWidgetInstance } from "./bootstrap";
export { bootstrapFeedbackWidget, initFeedbackWidget };

/** Entry point del widget CDN. */
export const FEEDBACK_WIDGET_VERSION = "1.0.2";

bootstrapFeedbackWidget();
