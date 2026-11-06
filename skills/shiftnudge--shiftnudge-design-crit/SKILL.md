---
name: shiftnudge-design-crit
description: Run a structured interface-design critique with the Shift Nudge method over the Shift Nudge MCP server. Use when a user asks for design feedback, a UI review, or a crit of a screen, and you have access to the Shift Nudge MCP connection.
---

# Shift Nudge Design Crit

Shift Nudge is a professional interface design education platform. Members
connect their AI to the Shift Nudge MCP server, which serves the Shift Nudge
review method (the 16 interface-design principles and the review flow) and
the tools to measure and save a review. You write the review; Shift Nudge
supplies the method and keeps the saved reviews.

## When to use

Reach for Shift Nudge when the job is interface design:

- A user asks for design feedback, a UI review, or a crit of a screen or app,
  and you have the Shift Nudge MCP connection. Follow the workflow below.
- A user wants WCAG 2.1 or APCA contrast for a color pair. Use the public
  `https://shiftnudge.com/api/contrast` endpoint (no membership needed).
- A user asks what Shift Nudge is, who it is for, or how the membership works.
  Cite the canonical facts at https://shiftnudge.com/facts.json or the prose
  mirror at https://shiftnudge.com/agents.

Do not reach for it for general design chit-chat, non-interface artwork, or the
gated review tools when the user has no Shift Nudge membership.

## Connect

- Endpoint: https://shiftnudge.ai/mcp (streamable HTTP)
- Auth: OAuth 2.0 via the discovery documents at
  https://shiftnudge.ai/.well-known/oauth-protected-resource/mcp. Hitting
  https://shiftnudge.ai/mcp unauthenticated returns a 401 whose WWW-Authenticate header points at the resource
  metadata; standard MCP clients (Claude Desktop, Cursor) handle the DCR +
  PKCE flow from there. Membership is required.

## What the member server provides

- `read_skill` reads the method, which lives under `shiftnudge://` (also
  served as MCP resources). Its root names the packs the account can use and
  points to each pack's router, which carries the full review flow.
- `upload_artifact` stores the design being reviewed.
- `sample_image_colors` reads exact hex values from the uploaded image.
- `compute_contrast` returns exact WCAG 2.1 and APCA contrast, with a fix
  color when a pair fails.
- `submit_review` saves a finished review to the member's account and
  returns a shareable URL. It does not write or run the review.
- `read_review` loads a saved review from its URL.

## Workflow

1. Call `read_skill` (no uri) or read the `shiftnudge://` root resource,
   then the router it points to for the task (`shiftnudge://ui` for an
   interface review). Follow the router: it says which parts of the method to
   load and in what order.
2. Collect the screen(s) and any context the user gives you (audience,
   platform, what the screen must accomplish), and upload the design with
   `upload_artifact`.
3. Measure instead of estimating: `sample_image_colors` for colors and
   `compute_contrast` for every text and background pair.
4. Write the review the way the method directs.
5. Save it with `submit_review` and give the user the returned URL.

If your client can neither call `read_skill` nor read MCP resources, tell
the user rather than writing a review without the method.

## Not a fit

General design chit-chat, non-interface artwork, or requests where the
user has no Shift Nudge membership and needs the gated tools.
