# Meridian Capital
Canadian money guide: life-stage guides, key 2026 figures with sources, CPP timing tool, growth calculator, demo advisor booking, 3D globe, and a Gemini-powered assistant.

## Pages
Home, Start, Investing (roadmap + risk quiz), ETFs (search, compare, fee calculator), Stocks (explainers + dividend estimator), Accounts (table + helper), Calculators (growth, savings goal, loan, CPP timing), Rates (live Bank of Canada data), Learn (glossary, lessons, safety), Book (demo).

## Files
- `*.html` – one file per page, with shared `style.css`, `data.js` (content) and `app.js` (logic)
- `api/rates.js` – serverless function fetching live Bank of Canada data
- `api/chat.js` – Vercel serverless function calling Gemini (key stays server-side)
- `.env.example` – variables to set
- `docs/DATA_SOURCES.md` – where each figure comes from

## Put it on GitHub
```
git init
git add .
git commit -m "Meridian Capital v1"
git branch -M main
git remote add origin https://github.com/KhushmeetBade/Meridian_Capital.git
git push -u origin main
```

## Deploy free on Vercel (Hobby plan)
1. vercel.com, sign up (free Hobby plan). Run `npx vercel --prod` in this folder, or import the GitHub repo.
2. Project, Settings, Environment Variables. Add one or both:
   - `GEMINI_API_KEY` (free key at aistudio.google.com). Default model `gemini-flash-latest`, Google's current Flash. For the strongest Gemini set `GEMINI_MODEL=gemini-pro-latest` (needs a paid Google plan).
   - `ANTHROPIC_API_KEY` (console.anthropic.com, paid usage). Tries `claude-fable-5-2`, then `claude-opus-5-5`, then `claude-sonnet-5-5`.
   If both are set, Claude is used first and Gemini is the fallback.
3. Redeploy (`npx vercel --prod`). Variables only apply to new deployments.
4. Open the chat bubble: the header shows which AI and model answered.
Never put keys in code or commit `.env`.

## Local
`npx vercel dev`
