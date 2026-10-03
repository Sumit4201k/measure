# Stitch integration research

Verified 2026-10-03. Exa reviewed 10 search results across two searches; findings below use Google Labs source and the publisher's actual npm artifacts, not third-party wrappers. No credentialed generation was performed.

## Verified API

- npm `latest` is **@google/stitch-sdk 0.3.5**, requiring Node >=18. Pin this version: the current GitHub main README differs from the published package. [Live publisher metadata](https://registry.npmjs.org/@google%2fstitch-sdk/latest), [published package](https://www.npmjs.com/package/@google/stitch-sdk/v/0.3.5), [Google Labs source](https://github.com/google-labs-code/stitch-sdk).
- `new StitchToolClient({ apiKey, timeout: 300_000 })` and `new Stitch(client)` give explicit server-side configuration. Calls auto-connect. `client.close()` closes transport. Default MCP endpoint: **https://stitch.googleapis.com/mcp**. API key uses `X-Goog-Api-Key`; OAuth requires `accessToken` plus `projectId`, corresponding to `STITCH_ACCESS_TOKEN` and `GOOGLE_CLOUD_PROJECT`, and sends bearer authorization plus `X-Goog-User-Project`. [Client source](https://github.com/google-labs-code/stitch-sdk/blob/main/packages/sdk/src/client.ts), [configuration](https://github.com/google-labs-code/stitch-sdk/blob/main/packages/sdk/src/spec/client.ts).
- Published 0.3.5 implements `sdk.createProject(title: string): Promise<Project>` and `sdk.project(id: string): Project`. `project.id` is a bare project ID. `createProject` calls `create_project` with `{ title }`. Do not copy a guessed response envelope: the published implementation passes the raw result to a `Project` constructor that reads `name`. [Published artifact inspected](https://registry.npmjs.org/@google/stitch-sdk/-/stitch-sdk-0.3.5.tgz), files `dist/generated/src/stitch.js` and `project.js`.
- Exact published signature: `project.generate(prompt: string, deviceType?: "DEVICE_TYPE_UNSPECIFIED" | "MOBILE" | "DESKTOP" | "TABLET" | "AGNOSTIC", modelId?: "MODEL_ID_UNSPECIFIED" | "GEMINI_3_PRO" | "GEMINI_3_FLASH" | "GEMINI_3_1_PRO"): Promise<Screen>`. It calls `generate_screen_from_text` with `{ projectId, prompt, deviceType, modelId }` and selects the first generated screen in `outputComponents[].design.screens`. Omit the model parameter to let the service choose its supported default. [Published artifact](https://registry.npmjs.org/@google/stitch-sdk/-/stitch-sdk-0.3.5.tgz), `dist/generated/src/project.d.ts` and `project.js`.
- `screen.getHtml(): Promise<string>` returns an **HTML download URL**, not markup. `screen.getImage(): Promise<string>` returns a screenshot URL. Both may return an empty string when no asset is available. They use cached generation data or call `get_screen` with project/screen IDs and a full resource name. [README](https://github.com/google-labs-code/stitch-sdk/blob/main/README.md), [published artifact](https://registry.npmjs.org/@google/stitch-sdk/-/stitch-sdk-0.3.5.tgz), `dist/generated/src/screen.js`.

## Recommended minimal adapter

Server only; use `npm install --save-exact @google/stitch-sdk@0.3.5`. If this is Next.js, add `import "server-only"` and select the Node runtime in the route. The separate `STITCH_PROJECT_ID` below is our application convention for reusing a Stitch project; it is not the OAuth Google Cloud project.

```ts
import { Stitch, StitchToolClient } from "@google/stitch-sdk";

export async function generateWithStitch(prompt: string) {
  const apiKey = process.env.STITCH_API_KEY?.trim();
  if (!apiKey) throw new Error("STITCH_NOT_CONFIGURED");

  const client = new StitchToolClient({ apiKey, timeout: 300_000 });
  const sdk = new Stitch(client);
  try {
    const existingId = process.env.STITCH_PROJECT_ID?.trim();
    const project = existingId
      ? sdk.project(existingId)
      : await sdk.createProject("Measure Flow campaign");
    const screen = await project.generate(prompt, "DESKTOP");
    const [htmlUrl, imageUrl] = await Promise.all([
      screen.getHtml(),
      screen.getImage(),
    ]);
    if (!htmlUrl) throw new Error("STITCH_HTML_UNAVAILABLE");
    const response = await fetch(htmlUrl, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error("STITCH_HTML_DOWNLOAD_FAILED");
    const html = await response.text();
    if (!html.trim()) throw new Error("STITCH_HTML_EMPTY");
    return {
      source: "stitch" as const,
      projectId: project.id,
      screenId: screen.id,
      html,
      htmlUrl,
      imageUrl: imageUrl || null,
    };
  } finally {
    // Cleanup failure must not replace the generation outcome.
    await client.close().catch(() => undefined);
  }
}
```

Implementation guidance (our recommendations): choose fixture mode before invoking this function if no key exists, with a visible `Prepared demo` label and `source: "fixture"` result. If configured live generation fails, display the failure honestly instead of silently claiming fixture output was generated. Keep credentials out of client bundles and responses. Render generated HTML in a sandboxed iframe rather than injecting it into the application's origin. Plan for the SDK's five-minute call timeout: a short-lived hosting route may need a queued job. Do not automatically retry mutations because a timed-out request may still create a screen. Do not assume a screenshot is guaranteed. Persist useful result IDs so retries can inspect an existing project.

## Current CLI

The publisher's npm `latest` is **@google/stitch 0.11.0**, Node >=20, binaries `stitch` and `stitch-mcp`. Its README documents:

```sh
npx @google/stitch@0.11.0 generate screen --new-project "Campaign" --prompt "A campaign landing page" --device DESKTOP --json
stitch login
stitch status
stitch generate screen --schema
stitch mcp install
```

`stitch login` performs browser OAuth with locally refreshed tokens. Canvas commands may additionally require `STITCH_API_KEY` and report `MISSING_CANVAS_CREDENTIALS` without it. CLI 0.11.0 model options differ from SDK 0.3.5 (`GEMINI_3_8_FLASH`, `GEMINI_3_5_FLASH_LITE` in CLI README), reinforcing the recommendation to omit model selection in the minimal SDK adapter. [Live CLI metadata](https://registry.npmjs.org/@google%2fstitch/latest), [publisher package](https://www.npmjs.com/package/@google/stitch/v/0.11.0).

The repository states this is not an officially supported Google product; avoid implying a support guarantee. [Repository disclaimer](https://github.com/google-labs-code/stitch-sdk#disclaimer).
