# Measure Flow — settled decision map

## Destination
An interactive marketing demo promoting Measure through a simulated mobile failure and a Stitch recovery-design integration, with a local product-flow guide. User cancelled video creation.

## Notes
Wayfinder was used to separate decisions from implementation. Existing PRD and direct user instructions settled scope; this is not an open-ended planning run. Local Markdown is the tracker. Implementation follows the user's explicit build request.

## Decisions so far
- **Marketing scope:** single-page visual demo, three curated failure scenarios, Measure CTA, comparison and downloadable story image.
- **Stitch feasibility:** [primary-source research](stitch-research.md) verifies SDK 0.3.5 and the MCP endpoint. Use server-side adapter, no invented live results.
- **Missing credentials:** prepared examples are explicit. Live operation can be enabled through server environment values.
- **Deliverables:** site in the user's vscodee directory plus guide; no video.

## Not yet specified
None blocking the prepared demo. Credentials and real provider smoke test remain prerequisites for live generation.

## Out of scope
Production monitoring implementation, automatic app fixes, public high-volume generation, persistent user uploads, a social feed, and video creation.
