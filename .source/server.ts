// @ts-nocheck
import { default as __fd_glob_21 } from "../content/docs/forms/meta.json?collection=docs"
import { default as __fd_glob_20 } from "../content/docs/sharing/meta.json?collection=docs"
import { default as __fd_glob_19 } from "../content/docs/responses/meta.json?collection=docs"
import { default as __fd_glob_18 } from "../content/docs/integrations/meta.json?collection=docs"
import { default as __fd_glob_17 } from "../content/docs/billing/meta.json?collection=docs"
import { default as __fd_glob_16 } from "../content/docs/meta.json?collection=docs"
import * as __fd_glob_15 from "../content/docs/sharing/overview.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/sharing/embedding.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/responses/viewing.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/responses/exporting.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/integrations/zapier.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/integrations/webhooks.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/integrations/api.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/forms/themes.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/forms/question-types.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/forms/logic.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/forms/builder.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/billing/subscription.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/billing/plans.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/quick-start.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/first-form.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_16, "billing/meta.json": __fd_glob_17, "integrations/meta.json": __fd_glob_18, "responses/meta.json": __fd_glob_19, "sharing/meta.json": __fd_glob_20, "forms/meta.json": __fd_glob_21, }, {"first-form.mdx": __fd_glob_0, "index.mdx": __fd_glob_1, "quick-start.mdx": __fd_glob_2, "billing/plans.mdx": __fd_glob_3, "billing/subscription.mdx": __fd_glob_4, "forms/builder.mdx": __fd_glob_5, "forms/logic.mdx": __fd_glob_6, "forms/question-types.mdx": __fd_glob_7, "forms/themes.mdx": __fd_glob_8, "integrations/api.mdx": __fd_glob_9, "integrations/webhooks.mdx": __fd_glob_10, "integrations/zapier.mdx": __fd_glob_11, "responses/exporting.mdx": __fd_glob_12, "responses/viewing.mdx": __fd_glob_13, "sharing/embedding.mdx": __fd_glob_14, "sharing/overview.mdx": __fd_glob_15, });