// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"first-form.mdx": () => import("../content/docs/first-form.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "quick-start.mdx": () => import("../content/docs/quick-start.mdx?collection=docs"), "billing/plans.mdx": () => import("../content/docs/billing/plans.mdx?collection=docs"), "billing/subscription.mdx": () => import("../content/docs/billing/subscription.mdx?collection=docs"), "forms/builder.mdx": () => import("../content/docs/forms/builder.mdx?collection=docs"), "forms/logic.mdx": () => import("../content/docs/forms/logic.mdx?collection=docs"), "forms/question-types.mdx": () => import("../content/docs/forms/question-types.mdx?collection=docs"), "forms/themes.mdx": () => import("../content/docs/forms/themes.mdx?collection=docs"), "integrations/api.mdx": () => import("../content/docs/integrations/api.mdx?collection=docs"), "integrations/webhooks.mdx": () => import("../content/docs/integrations/webhooks.mdx?collection=docs"), "integrations/zapier.mdx": () => import("../content/docs/integrations/zapier.mdx?collection=docs"), "responses/exporting.mdx": () => import("../content/docs/responses/exporting.mdx?collection=docs"), "responses/viewing.mdx": () => import("../content/docs/responses/viewing.mdx?collection=docs"), "sharing/embedding.mdx": () => import("../content/docs/sharing/embedding.mdx?collection=docs"), "sharing/overview.mdx": () => import("../content/docs/sharing/overview.mdx?collection=docs"), }),
};
export default browserCollections;