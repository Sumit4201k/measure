# Deploy Measure Flow on Vercel

1. In Vercel, choose **Add New → Project** and import `Sumit4201k/measure`.
2. Use branch `main`, root directory `./`, framework **Next.js**, and Node **22.x**.
3. Keep install command `npm ci`, build command `npm run build`, and the default Next.js output directory. Do not set `dist` as the output directory.
4. Deploy. The complete frontend demo works without any environment variables.

## Optional live Stitch generation

Add these server-side environment variables in Vercel, then redeploy:

| Variable | Value |
|---|---|
| `STITCH_ENABLED` | `true` |
| `STITCH_API_KEY` | Your private Stitch API key |
| `STITCH_PROJECT_ID` | Optional existing Stitch project ID |
| `STITCH_DEMO_TOKEN` | A long random private access code, at least 32 random bytes recommended |

Never prefix these variables with `NEXT_PUBLIC_`. Never commit the API key or access code.

Open **Stitch integration** on the site and enter the demo access code. This is the value of `STITCH_DEMO_TOKEN`, not the Stitch API key. The code is kept only in tab memory and sent as an authorization header to the backend. Visitors without it can use the prepared examples.

The route uses the Node runtime and requests a 240-second maximum duration, with a 180-second provider call timeout. Check that the Vercel project plan/runtime supports the requested duration. A timed-out request may still complete at the provider; the app does not automatically retry it.

The cooldown is per server instance, not a durable global quota. Keep live generation restricted to trusted demo users; add a persistent quota and job system before a large public live-generation campaign.

## Commands

```sh
npm ci
npm run dev
npm run build
npm start
```

The app uses standard Next.js for these commands. Historical Sites files remain for reference, but Vercel does not use the Cloudflare/Vinext build path. The previously published Sites URL is not updated by this migration.

## Checks

- Prepared mode: `/api/stitch` returns `configured: false` without server secrets.
- Live mode: requires all of `STITCH_ENABLED=true`, `STITCH_API_KEY`, and `STITCH_DEMO_TOKEN`.
- Missing or incorrect access code: generation is rejected with 401.
- Provider keys are never returned to the browser.

References: [Next.js deployment on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [function duration](https://vercel.com/docs/functions/configuring-functions/duration).
