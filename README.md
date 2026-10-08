# LinkedIn Hook Grader

A production-ready Next.js tool for scoring the opening lines of a LinkedIn post and generating three stronger rewrites.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Production build

```bash
npm run build
npm run start
```

## Vercel deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the required environment variables in the Vercel dashboard.
4. Deploy.

The app is built with the Next.js App Router and works with Vercel without requiring a separate Express server.

## Required environment variables

- `GEMINI_API_KEY`: required for generating the 3 rewrite suggestions.
- `NEXT_PUBLIC_SUPABASE_URL`: the URL for your Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the public Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: optional server-side key for privileged inserts if you want to use an admin client.

> Do not expose the service role key in browser-based code.

## Notes

- The deterministic score is calculated entirely in code.
- The score is based on five rules, each worth 20 points.
- Gemini is used only to generate improved hooks, not to calculate the score.
- Task 01 Make.com webhook integration is intentionally not implemented in this version.

