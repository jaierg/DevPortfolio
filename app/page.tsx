"use client";
import ChatWidget from '@/components/ChatWidget';
import ParticleCanvas from '@/components/ParticleCanvas';

export default function Home() {
  const experience = [
    { year: '2024 — now',     role: 'Software Engineer II', company: 'NCR Voyix · Atlanta, GA', desc: 'Led end-to-end delivery of AI-driven features, reducing delivery time by 60%. Architected AI-powered workflows automating development tasks and co-founded a company-wide AI knowledge-sharing initiative. Holds two patents in the self-checkout domain.' },
    { year: '2022 — 2024',    role: 'Software Engineer I',  company: 'NCR Voyix · Atlanta, GA', desc: 'Built and integrated React TS components with REST APIs. Maintained Playwright test coverage across high-frequency releases. Enforced theming and accessibility standards across deployments.' },
    { year: 'May–Aug 2021',   role: 'Software Engineer Intern', company: 'NCR · Atlanta, GA', desc: 'Built a React Native app with real-time MQTT communication for an IoT self-checkout system. Improved monitoring efficiency 15% via integrated AR alerting.' },
    { year: 'Jun–Aug 2020',   role: 'Software Engineer Intern', company: 'NCR · Remote', desc: 'Integrated a third-party loyalty rewards API into NCR\'s native iOS app (Swift/Xcode). Assisted in feature development and testing for the Engage mobile app.' },
    { year: 'Jan–May 2020',   role: 'Software Engineer Co-Op', company: 'DataPath · Duluth, GA', desc: 'Built 15+ custom UI pages and developed device automation integrations across a commercial software platform.' },
    { year: 'May–Aug 2019',   role: 'Application Developer Intern', company: 'Better Business Bureau · Atlanta, GA', desc: 'Led a 4-person team building a mobile app with Angular and Ionic 4. Designed architecture diagrams mapping feature flows and user interactions.' },
  ];

  const projects = [
    {
      title: 'jaier.dev',
      status: 'In progress',
      active: true,
      desc: 'This portfolio — a Next.js 14 app with a RAG-powered AI assistant. Indexes resume and GitHub repos into Supabase pgvector, streams responses via Vercel AI SDK and GPT-4o-mini.',
      tags: ['Next.js', 'TypeScript', 'Vercel AI SDK', 'Supabase pgvector', 'OpenAI'],
    },
    {
      title: 'AI Portfolio Chatbot',
      status: 'Shipped',
      active: false,
      desc: 'A React.js application integrated with the OpenAI API, connected to GitHub to surface project details and career experience through natural language.',
      tags: ['React', 'OpenAI API', 'GitHub API'],
    },
    {
      title: 'Recipe Finder App',
      status: 'Shipped',
      active: false,
      desc: 'A recipe search engine in React with login system, connected to the Spoonacular API and YouTube API for video results.',
      tags: ['React', 'Spoonacular API', 'YouTube API'],
    },
  ];

  const skills = [
    { label: 'LANGUAGES',      items: ['TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Swift', 'JSON'] },
    { label: 'FRAMEWORKS',     items: ['React', 'Next.js', 'React Native', 'Tailwind CSS', 'Playwright', 'Cypress'] },
    { label: 'AI / LLM',       items: ['Vercel AI SDK', 'OpenAI API', 'RAG Pipelines', 'LangChain', 'Pinecone', 'GitHub Copilot'] },
    { label: 'INFRASTRUCTURE', items: ['Git / GitHub', 'Docker', 'Kubernetes', 'REST APIs', 'Microservices', 'Vercel'] },
  ];

  return (
    <>
      <ParticleCanvas />

      {/* Glow orb */}
      <div style={{
        position: 'fixed',
        top: '4%', right: '-5%',
        width: 'min(400px,80vw)', height: 'min(400px,80vw)',
        borderRadius: '50%',
        background: 'radial-gradient(circle,#00E87B0E 0%,#00E87B04 50%,transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(60px)',
        animation: 'orbFloat 9s ease-in-out infinite',
        zIndex: 2,
      }} />

      {/* Top accent bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'var(--accent)', zIndex: 200 }} />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: '2px', left: 0, right: 0, height: '60px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 clamp(20px,5vw,40px)',
        background: 'rgba(10,10,11,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid var(--border)',
        zIndex: 100,
      }}>
        <a href="#" style={{ color: 'var(--accent)', fontSize: '15px', fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", textDecoration: 'none', letterSpacing: '0.5px' }}>
          jaier.dev
        </a>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {['experience', 'projects', 'skills', 'contact'].map(l => (
            <a key={l} href={`#${l}`} style={{ color: 'var(--text-m)', fontSize: '12px', fontFamily: "'JetBrains Mono',monospace", textDecoration: 'none', letterSpacing: '0.5px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-p)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-m)')}
              className="nav-link-desktop"
            >{l}</a>
          ))}
          <a href="#contact" style={{
            background: 'var(--accent)', color: '#0A0A0B',
            padding: '8px 18px', borderRadius: '7px',
            fontSize: '12px', fontWeight: 600,
            fontFamily: "'JetBrains Mono',monospace",
            textDecoration: 'none', transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >let's talk</a>
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ position: 'relative', zIndex: 10, paddingTop: '62px' }}>

        {/* HERO */}
        <section id="about" style={{ padding: 'clamp(40px,8vw,80px) clamp(20px,5vw,40px) clamp(32px,6vw,56px)', maxWidth: '760px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', opacity: 0, animation: 'fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s forwards' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px #00E87B80', animation: 'pulse 2s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-m)', fontSize: '13px' }}>Open to new opportunities</span>
          </div>
          <h1 style={{ fontSize: 'clamp(52px,13vw,96px)', fontWeight: 800, lineHeight: 0.9, letterSpacing: 'clamp(-1px,-0.04em,-4px)', margin: '0 0 10px', opacity: 0, animation: 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s forwards' }}>
            <span style={{ color: 'var(--text-p)' }}>JAIER<br /></span>
            <span style={{ WebkitTextStroke: 'clamp(1.5px,0.3vw,2.5px) var(--accent)', color: 'transparent' }}>GORDON</span>
          </h1>
          <p style={{ fontSize: 'clamp(11px,2.5vw,14px)', color: 'var(--accent)', letterSpacing: 'clamp(2px,0.5vw,3px)', fontWeight: 500, margin: '0 0 20px', fontFamily: "'JetBrains Mono',monospace", opacity: 0, animation: 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s forwards' }}>
            FRONT-END ENGINEER
          </p>
          <p style={{ fontSize: 'clamp(14px,2.2vw,15px)', color: 'var(--text-s)', lineHeight: 1.75, maxWidth: '500px', margin: '0 0 28px', opacity: 0, animation: 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.4s forwards' }}>
            Building customer-facing AI experiences and scalable front-end systems. 4+ years shipping production React at NCR Voyix — now looking for my next challenge.
          </p>
          <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', opacity: 0, animation: 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.5s forwards' }}>
            {['React', 'TypeScript', 'Next.js', 'AI / LLM', 'Chatbot UI', 'Node.js'].map(tag => (
              <span key={tag} style={{ background: 'var(--surface-el)', border: '0.5px solid var(--border)', color: 'var(--text-s)', fontSize: '11px', padding: '6px 13px', borderRadius: '20px', fontFamily: "'JetBrains Mono',monospace", transition: 'all 0.2s', whiteSpace: 'nowrap', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#00E87B60'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-s)'; }}
              >{tag}</span>
            ))}
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" className="fade-section" style={{ padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,40px)' }}>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--text-m)', marginBottom: '32px', fontFamily: "'JetBrains Mono',monospace" }}>EXPERIENCE</p>
          {experience.map((exp, i) => (
            <div key={i} className="fade-item" style={{ display: 'flex', gap: '20px', marginBottom: '28px' }}>
              <span style={{ color: 'var(--text-m)', fontSize: '11px', minWidth: '90px', paddingTop: '3px', fontFamily: "'JetBrains Mono',monospace", flexShrink: 0, lineHeight: 1.5 }}>{exp.year}</span>
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '18px' }}>
                <div style={{ color: 'var(--text-p)', fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{exp.role}</div>
                <div style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 500, fontFamily: "'JetBrains Mono',monospace" }}>{exp.company}</div>
                <p style={{ color: 'var(--text-s)', fontSize: '13px', lineHeight: 1.65, marginTop: '7px' }}>{exp.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* PROJECTS */}
        <section id="projects" className="fade-section" style={{ padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,40px)' }}>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--text-m)', marginBottom: '32px', fontFamily: "'JetBrains Mono',monospace" }}>PROJECTS</p>
          {projects.map((proj, i) => (
            <div key={i} className="fade-item project-card" style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '20px 22px', marginBottom: '12px', transition: 'border-color 0.3s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#00E87B50')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '10px' }}>
                <span style={{ color: 'var(--text-p)', fontSize: 'clamp(15px,3.5vw,17px)', fontWeight: 600 }}>{proj.title}</span>
                <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap', flexShrink: 0, color: proj.active ? 'var(--accent)' : 'var(--text-m)', background: proj.active ? '#00E87B15' : 'var(--surface-el)' }}>{proj.status}</span>
              </div>
              <p style={{ color: 'var(--text-s)', fontSize: '13px', lineHeight: 1.65, marginBottom: '14px' }}>{proj.desc}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {proj.tags.map(t => <span key={t} style={{ background: 'var(--surface-el)', color: 'var(--text-m)', fontSize: '11px', padding: '4px 9px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>{t}</span>)}
              </div>
            </div>
          ))}
        </section>

        {/* SKILLS */}
        <section id="skills" className="fade-section" style={{ padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,40px)' }}>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--text-m)', marginBottom: '32px', fontFamily: "'JetBrains Mono',monospace" }}>SKILLS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '12px' }}>
            {skills.map((cat, i) => (
              <div key={i} className="fade-item" style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
                <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', marginBottom: '11px', fontFamily: "'JetBrains Mono',monospace" }}>{cat.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {cat.items.map(item => <span key={item} style={{ background: 'var(--surface-el)', color: 'var(--text-s)', fontSize: '11px', padding: '4px 10px', borderRadius: '5px', border: '0.5px solid var(--border)' }}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="fade-section" style={{ padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,40px)', paddingBottom: '120px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--text-m)', marginBottom: '32px', fontFamily: "'JetBrains Mono',monospace" }}>CONTACT</p>
          <p style={{ color: 'var(--text-s)', fontSize: '15px', lineHeight: 1.75, maxWidth: '460px', marginBottom: '24px' }}>
            Currently open to front-end engineering roles focused on AI-powered product experiences. Based in Atlanta, GA — open to hybrid or remote.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href="mailto:jaiergordon@gmail.com" style={{ background: 'var(--accent)', color: '#0A0A0B', padding: '12px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', fontFamily: "'JetBrains Mono',monospace", transition: 'opacity 0.2s', display: 'inline-block' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >jaiergordon@gmail.com</a>
            <a href="tel:7709906467" style={{ background: 'var(--surface)', color: 'var(--text-s)', padding: '12px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '0.5px solid var(--border)', fontFamily: "'JetBrains Mono',monospace", transition: 'all 0.2s', display: 'inline-block' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#00E87B60'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-s)'; }}
            >(770) 990-6467</a>
          </div>
        </section>
      </main>

      <footer style={{ padding: '28px clamp(20px,5vw,40px)', borderTop: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 10 }}>
        <span style={{ color: 'var(--text-m)', fontSize: '11px', fontFamily: "'JetBrains Mono',monospace" }}>© 2026 Jaier Gordon</span>
        <div style={{ display: 'flex', gap: '18px' }}>
          {['GitHub', 'LinkedIn', 'Resume'].map(l => (
            <a key={l} href="#" style={{ color: 'var(--text-m)', fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-m)')}
            >{l}</a>
          ))}
        </div>
      </footer>

      <ChatWidget />

      {/* Scroll reveal script */}
      <script dangerouslySetInnerHTML={{ __html: `
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.style.opacity = '1';
              e.target.style.transform = 'translateY(0)';
            }
          });
        }, { threshold: 0.1 });
        document.querySelectorAll('.fade-section, .fade-item').forEach(el => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(18px)';
          el.style.transition = 'opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1)';
          io.observe(el);
        });
      `}} />
    </>
  );
}
