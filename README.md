# Eco Monitoring (Lab 4)

## Links
- **Repository**: https://github.com/Shvets-Maxx/WEB

## Environment variables
Copy `.env.example` to `.env.local` and fill values as needed:

- `NEXT_PUBLIC_GA_ID` — optional Google Analytics Measurement ID
- `LOG_LEVEL` — logger level (`debug|info|warn|error`)

## CI
GitHub Actions workflow is in `.github/workflows/ci.yml` and runs on every push / pull request:
- TypeScript type-check
- Next.js lint
- Next.js build
