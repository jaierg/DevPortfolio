# Contributing

Welcome! This is a personal portfolio project, but contributions are welcome. Here's how to contribute:

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/jaier-dev.git
cd jaier-dev
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Local Environment

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase and OpenAI credentials.

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
jaier-dev/
├── app/
│   ├── api/
│   │   └── chat/route.ts      # RAG chat endpoint
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Portfolio page
├── components/
│   ├── ChatWidget.tsx          # Chat component
│   └── ParticleCanvas.tsx      # Background animation
├── scripts/
│   └── ingest.ts               # Knowledge ingestion
└── docs/
    ├── README.md
    ├── ARCHITECTURE.md
    ├── API.md
    └── CONTRIBUTING.md
```

## Making Changes

### Before You Start

1. Create a branch: `git checkout -b feature/your-feature-name`
2. Make changes
3. Test locally: `npm run dev`
4. Commit: `git commit -m "feat: describe your change"`
5. Push: `git push origin feature/your-feature-name`
6. Open a Pull Request

### Code Style

- **TypeScript**: Use strict mode, define types
- **React**: Functional components, hooks
- **Formatting**: Uses Prettier (no explicit config, follows defaults)
- **Comments**: Only add comments for non-obvious logic

### Testing

Currently no automated tests. Before submitting:

1. Test chat locally with various queries
2. Verify no console errors
3. Check responsive design on mobile
4. Test in incognito/private window

## Common Contributions

### 1. Bug Fixes

**Example:** Fix styling bug in ChatWidget

```bash
git checkout -b fix/chat-widget-styling
# Make changes
git commit -m "fix: adjust ChatWidget padding on mobile"
git push origin fix/chat-widget-styling
```

### 2. Features

**Example:** Add conversation history

```bash
git checkout -b feature/conversation-history
# Implement feature
git commit -m "feat: add persistent conversation history"
git push origin feature/conversation-history
```

### 3. Documentation

**Example:** Improve README

```bash
git checkout -b docs/improve-readme
# Update README.md
git commit -m "docs: clarify deployment steps"
git push origin docs/improve-readme
```

### 4. Performance

**Example:** Optimize pgvector queries

```bash
git checkout -b perf/optimize-vector-search
# Optimize search
git commit -m "perf: add pgvector query caching"
git push origin perf/optimize-vector-search
```

## Pull Request Process

1. **Descriptive Title**: `feat: add X` or `fix: resolve Y`
2. **Description**: Explain *what* changed and *why*
3. **Testing**: Note what you tested
4. **Screenshots**: Include if UI changes

**Example PR Description:**

```markdown
## What
Add GitHub-style markdown support to chat responses

## Why
Chat responses currently don't format code blocks nicely. This adds 
markdown rendering to improve readability.

## Testing
- Tested with code snippets in queries
- Verified on desktop and mobile
- No console errors

## Screenshots
[Screenshot of formatted code block]
```

## Deployment

### Local Deployment

```bash
npm run build
npm run start
```

### Vercel Deployment

Connected repos auto-deploy on push. No special action needed.

Check deployment status in Vercel dashboard.

## Architecture Guidelines

### RAG Pipeline

- Always embed queries consistently (use same model + dimension)
- Keep chunks under 500 words for better retrieval
- Test retrieval quality: `npm run ingest && test queries`

### API Endpoint

- `/api/chat` is the main endpoint
- Streaming is required (SSE format)
- Max 30 seconds (Vercel limit)
- Error handling should be robust

### Database

- Never modify RLS policies without security review
- Test queries for performance (check pgvector index)
- Always rollback migrations if something breaks

## Performance Checklist

- [ ] API response < 5 seconds on first query
- [ ] pgvector search completes in < 100ms
- [ ] No N+1 queries
- [ ] Streaming starts within 1 second
- [ ] Mobile UI responsive (tested on actual device)

## Security Checklist

- [ ] No API keys hardcoded
- [ ] No secrets in commits
- [ ] SQL is parameterized (no injection)
- [ ] CORS headers appropriate
- [ ] RLS policies verified

## Release Process

### Versioning

Uses semver:
- `0.1.0` — Initial release
- `0.2.0` — New features
- `0.2.1` — Bug fixes

### Releasing

1. Update version in `package.json`
2. Update `CHANGELOG.md` (create if needed)
3. Commit: `git commit -m "release: v0.2.0"`
4. Tag: `git tag v0.2.0`
5. Push: `git push origin main && git push origin v0.2.0`
6. Vercel auto-deploys main

## Questions?

- **Ask on Issues**: Open an issue with the question tag
- **Email**: jaiergordon@gmail.com
- **Discussions**: Use GitHub Discussions (if enabled)

## License

By contributing, you agree your code is licensed under MIT.

---

**Thanks for contributing! ❤️**
