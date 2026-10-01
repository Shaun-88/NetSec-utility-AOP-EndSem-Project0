# Breach Checker (`#014`)

**Category:** `cybersecurity` | **Complexity:** `intermediate` | **Requires Server:** `true`

## What it does

Checks an email address against the [BreachDirectory](https://breachdirectory.org/) database via RapidAPI. Shows each breach source the email appeared in and whether password data was exposed.

## Architecture

| File | Role |
|------|------|
| `schema.ts` | Validates input is a real email address (`z.string().email()`) |
| `compute.ts` | Pure function — flattens BreachDirectory sources into `BreachEntry[]` |
| `server.ts` | Calls BreachDirectory via RapidAPI; reads `RAPIDAPI_KEY` from env (server-only) |
| `BreachCheckerTool.tsx` | Client UI — breach source tags, summary banner, disclaimer |
| `breach-checker.test.ts` | Unit tests for schema and compute |

## Environment

```
RAPIDAPI_KEY=your-rapidapi-key-here
```

Get your key at: https://rapidapi.com — subscribe to the **BreachDirectory** API.
Free tier: 50 requests/day.

> **Privacy:** The email is sent only to the BreachDirectory API via RapidAPI. It is **not** stored by this app (beyond the global 48-hour ephemeral history retention).

## Data Sources

- [BreachDirectory API via RapidAPI](https://rapidapi.com/rohan-patra/api/breachdirectory)
