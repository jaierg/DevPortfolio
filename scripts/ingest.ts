import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;
const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

async function dbInsert(row: object) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/documents`, { method: 'POST', headers: { ...headers, 'Prefer': 'return=minimal' }, body: JSON.stringify(row) });
  if (!res.ok) throw new Error(`Insert failed: ${await res.text()}`);
}
async function dbDeleteAll() {
  await fetch(`${SUPABASE_URL}/rest/v1/documents?id=gte.0`, { method: 'DELETE', headers });
}
function chunkText(text: string, size = 500, overlap = 80): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) { chunks.push(words.slice(i, i + size).join(' ')); i += size - overlap; }
  return chunks.filter(c => c.trim().length > 40);
}
async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text.trim() });
  return res.data[0].embedding;
}
async function upsertChunks(chunks: string[], source: string, type: string) {
  console.log(`  Inserting ${chunks.length} chunks from [${source}]...`);
  for (const chunk of chunks) { const embedding = await embed(chunk); await dbInsert({ content: chunk, embedding, metadata: { source, type } }); }
  console.log(`  ✓ Done [${source}]`);
}

const RESUME = `JAIER GORDON — Atlanta, GA | jaiergordon@gmail.com | (770) 990-6467
Front-End Engineer, 4+ years production React/TypeScript at NCR Voyix.
Software Engineer II — NCR Voyix (Jul 2024–Present): Led end-to-end UI feature delivery. AI-driven strategies reduced delivery time 60%. Architected AI-powered dev automation. Reusable React TS patterns. Two patents. Co-founded AI knowledge-sharing initiative.
Software Engineer I — NCR Voyix (Feb 2022–Jul 2024): React TS components with REST APIs. 10+ features. Playwright testing. UX theming and accessibility.
Software Engineer Intern — NCR (May–Aug 2021): React Native MQTT app for self-checkout. 15% efficiency improvement via AR alerting.
Software Engineer Intern — NCR Remote (Jun–Aug 2020): Clutch loyalty API integration in Swift/Xcode iOS app.
Software Engineer Co-Op — DataPath (Jan–May 2020): 15+ custom UI pages, device automation, TCL drivers.
Application Developer Intern — BBB (May–Aug 2019): Led 4-person team, Angular/Ionic 4 mobile app.
PROJECTS: jaier.dev (Next.js RAG chatbot, Vercel AI SDK, Supabase pgvector), Recipe Finder (React, Spoonacular, YouTube API), AI Portfolio Chatbot (React, OpenAI, GitHub API).
EDUCATION: Georgia State University B.S. Computer Science. ACM, PantherHackers.
SKILLS: React, TypeScript, JavaScript, Next.js, React Native, HTML5, CSS3, Swift, Playwright, Vercel AI SDK, OpenAI API, RAG, LangChain, Pinecone, GitHub Copilot, Docker, Kubernetes, REST APIs, Git/GitHub, Vercel, MQTT.
Available for hybrid/remote roles. Atlanta GA. jaiergordon@gmail.com (770) 990-6467`;

const ABOUT = `Jaier Gordon is a Front-End Engineer with 4+ years at NCR Voyix. Specializes in customer-facing React/TypeScript and AI-powered workflows. Progressed intern to SE II at NCR. Holds two patents. Co-founded internal AI initiative. Reduced delivery time 60%. Seeking front-end roles in AI product experiences, conversational UI, chatbot interfaces, LLM systems. Portfolio jaier.dev has a working RAG chatbot.`;

const IMPACT_SUMMARY = `# Jaier Gordon — NCR Voyix Impact Summary
### Self-Checkout (SCO) Team | QuickLook: jg185441 (current), jg185399 (prior)

## Contribution Summary — Who I Am as a Developer

Jaier Gordon is a full-stack software engineer and technical leader on the NCR Voyix Self-Checkout (SCO) team, operating across the entire stack — from React UI components to Node.js backend adapters, Kubernetes DevOps configurations, Helm chart infrastructure, and automated test suites. Over the course of his time on the SCO team, Jaier has evolved from an individual contributor into a developer who owns features end-to-end, drives production debugging across distributed microservices, mentors through code reviews, and leads company-wide AI innovation initiatives.

## Executive Summary Metrics

Jira Tickets Assigned: 114 | Completed (Done): 62 | Triaged/Withdrawn: 29 | Tickets Reported: 15
GitHub PRs Authored: 162 | Merged: 106 | Reviewed: 88 | PR Comments/Discussions: 97 | Issues Participated: 122 | Issues Created: 44
Repos Contributed To: 10 | Total Commits: 125+
Invention Disclosure Reports: 3 | Issued Patents: 2

## GitHub Contributions — Year Over Year

Year 2024: 3 merged PRs | Year 2025: 66 merged PRs | Year 2026 (YTD through May): 38 merged + 16 open (60 authored)
Trajectory: 22x growth from 2024→2025. In 2026, already 60 PRs authored on pace to significantly exceed 2025 totals.

## Repository Breakdown — 10 Repositories Across Full Stack

retail-desktop-pos (SCO UI): 61 merged PRs | scoxresources (Strings/i18n): 18 merged PRs | jarvis-devops (DevOps): 8 merged PRs
jarvis-config-service: 7 merged PRs | emerald-desktop-bff (BFF): 5 merged PRs | scoxtest2.0 (Automation): 3 merged PRs
jarvis-helm-umbrella-chart, scoxendpoint, scoxintervention, scoxtest: 1 merged PR each

## End-to-End Features Implemented (UI + Backend + Config + DevOps)

1. Post-Pay Fuel Integration (SCOX-37370) — Full end-to-end across retail-desktop-pos, emerald-desktop-bff, jarvis-devops, jarvis-config-service, scoxintervention. 6 merged PRs across 5 repos. Pump selection screen, fuel item addition, backend override handling, DevOps config, fiscal org setup.

2. Fiscal Invoice Flow (SCOX-37384) — Full end-to-end for BP Poland fiscal requirements. Invoice/receipt document selection, NIP entry, B2B flow. 13+ merged PRs across 5 repos.

3. Check Basket Reminder (SCOX-37759) — Check basket reminder modal with audio prompts. Config-driven feature toggle. 15+ merged PRs across 4 repos including 10+ follow-up bug fixes.

4. Mobile Shopper Integration (SCOX-38579, SCOX-40129) — QR code display, hybrid pull flow, in-progress modal. 11+ merged PRs across 3 repos with multiple edge case fixes.

5. Delayed Promotions (SCOX-36259) — Full end-to-end promotion display and handling. 4 merged PRs across 3 repos.

6. Training Mode Improvements (SCOX-35818, SCOX-34177, SCOX-33639) — Permission-required flow, quick exit mode fix, access denied redesign. 5+ merged PRs.

7. Critical Service Alerts (SCOX-34779) — Moved EDS critical service alerts to endpoint. 4 merged PRs across 4 repos including Helm chart updates.

8. Coupon Tender Flow (SCOX-34512) — Approve coupon flow redesign, intervention scanner fix. 2 merged PRs.

## Production & Customer Impact

Hands-on production debugging across distributed microservices (MQTT brokers, linkerd service mesh, Kubernetes pods, fiscal printers)
Direct support for BP Poland NPI team — debugging lane setup issues, fiscal configuration, selling-service connectivity
Root cause analysis on critical fiscal printer failures (EFSTA 0x6010) that blocked revenue on production lanes
Diagnosed MQTT broker isolation issue preventing fuel client translations from reaching SCO lanes
28 bugs fixed out of 38 assigned — 74% resolution rate
11 production incidents resolved out of 42 assigned

## AI Leadership & Innovation

Co-founded bi-weekly AI knowledge-sharing call — Company-wide meeting where team members share latest AI tools, workflows, discoveries
Led presentations on AI-powered development — GitHub Copilot CLI, GitHub Copilot, skills and extensibility
Active hands-on use of AI tools in daily workflow — AI-assisted log analysis for debugging, cross-codebase investigation, documentation generation
Recognized as internal champion accelerating AI adoption across the organization`;

async function fetchGitHub() {
  const username = process.env.GITHUB_USERNAME || 'jaierg';
  const token = process.env.GITHUB_TOKEN;
  const gh: Record<string,string> = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'jaier-ingest' };
  if (token) gh['Authorization'] = `token ${token}`;
  console.log(`\nFetching GitHub repos for @${username}...`);
  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated`, { headers: gh });
  if (!res.ok) { console.warn(`  GitHub ${res.status} — skipping.`); return; }
  const repos = await res.json() as any[];
  console.log(`  Found ${repos.length} repos`);
  for (const repo of repos) {
    if (repo.fork) continue;
    let text = `Repo: ${repo.full_name}\nDesc: ${repo.description||'none'}\nLang: ${repo.language||'none'}\nURL: ${repo.html_url}`;
    try { const r = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, { headers: gh }); if (r.ok) { const d = await r.json() as any; text += `\nREADME:\n${Buffer.from(d.content,'base64').toString('utf-8').slice(0,2000)}`; } } catch {}
    try { const r = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/package.json`, { headers: gh }); if (r.ok) { const d = await r.json() as any; const p = JSON.parse(Buffer.from(d.content,'base64').toString('utf-8')); text += `\nDeps: ${Object.keys({...p.dependencies,...p.devDependencies}).join(', ')}`; } } catch {}
    await upsertChunks(chunkText(text, 400, 60), `github:${repo.name}`, 'github');
    await new Promise(r => setTimeout(r, 300));
  }
}

async function main() {
  console.log('\n🚀 Ingesting...\n');
  await dbDeleteAll();
  console.log('📄 Resume...'); await upsertChunks(chunkText(RESUME), 'resume', 'resume');
  console.log('👤 About...'); await upsertChunks(chunkText(ABOUT), 'about', 'about');
  console.log('📊 Impact Summary...'); await upsertChunks(chunkText(IMPACT_SUMMARY, 600, 100), 'impact-summary', 'impact');
  await fetchGitHub();
  console.log('\n✅ Done!\n');
}
main().catch(console.error);
