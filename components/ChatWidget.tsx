'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';

const STARTERS = [
  "What's his experience building chatbot UIs?",
  "Tell me about his AI work at NCR Voyix",
  "What's the tech stack of this portfolio?",
  "What React patterns and architecture does he use?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [startersVisible, setStartersVisible] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/chat',
  });

  // Tooltip timer
  useEffect(() => {
    const t1 = setTimeout(() => setShowTooltip(true), 3000);
    const t2 = setTimeout(() => setShowTooltip(false), 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleOpen = () => {
    setShowTooltip(false);
    setOpen(true);
  };

  const handleStarterClick = (q: string) => {
    setStartersVisible(false);
    setInput(q);
    // Submit after state updates
    setTimeout(() => {
      const form = document.getElementById('chat-form') as HTMLFormElement;
      form?.requestSubmit();
    }, 50);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;

  return (
    <>
      {/* FAB */}
      {!open && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(24px + var(--safe-bottom))',
          right: '20px',
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          {showTooltip && (
            <div style={{
              background: 'var(--surface)',
              border: '0.5px solid var(--border)',
              borderRadius: '10px',
              padding: '10px 13px',
              color: 'var(--text-s)',
              fontSize: '12px',
              lineHeight: '1.5',
              maxWidth: '170px',
              animation: 'tooltipIn 0.4s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              <strong style={{ color: 'var(--text-p)', fontWeight: 500 }}>Ask my AI</strong> anything about my experience
            </div>
          )}
          <button
            onClick={handleOpen}
            aria-label="Open AI chat assistant"
            style={{
              width: '54px', height: '54px',
              borderRadius: '50%',
              background: 'var(--accent)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,232,123,0.3), 0 8px 32px rgba(0,0,0,0.4)',
              transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(0,232,123,0.4), 0 8px 32px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,232,123,0.3), 0 8px 32px rgba(0,0,0,0.4)';
            }}
          >
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed',
          zIndex: 500,
          background: 'var(--surface)',
          border: '0.5px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 16px 64px rgba(0,0,0,0.6)',
          animation: 'chatSlide 0.35s cubic-bezier(0.22,1,0.36,1)',
          // Mobile: bottom sheet; Desktop: corner panel
          ...(isMobile ? {
            bottom: 0, left: 0, right: 0,
            width: '100%', height: '70vh',
            borderRadius: '16px 16px 0 0',
          } : {
            bottom: '24px', right: '24px',
            width: '360px', height: '520px',
            borderRadius: '16px',
          }),
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '0.5px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                <span style={{ color: 'var(--text-p)', fontSize: '14px', fontWeight: 600 }}>Ask about Jaier</span>
              </div>
              <div style={{ color: 'var(--text-m)', fontSize: '10px', marginTop: '2px', fontFamily: "'JetBrains Mono', monospace" }}>
                AI · resume + GitHub + projects
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-m)', cursor: 'pointer',
                fontSize: '18px', padding: '6px',
                borderRadius: '6px', lineHeight: 1,
                minWidth: '36px', minHeight: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-el)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-p)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'none';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-m)';
              }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '14px',
            display: 'flex', flexDirection: 'column', gap: '10px',
            WebkitOverflowScrolling: 'touch' as any,
          }}>
            {/* Welcome message */}
            <div style={{
              alignSelf: 'flex-start',
              background: 'var(--surface-el)',
              color: '#CCC',
              borderRadius: '14px 14px 14px 4px',
              padding: '10px 14px',
              fontSize: '13px', lineHeight: '1.65',
              maxWidth: '88%',
              animation: 'msgIn 0.3s ease-out',
            }}>
              Hey! I'm Jaier's AI assistant. I know his full resume, GitHub projects, and experience. What would you like to know?
            </div>

            {/* Starter questions */}
            {startersVisible && messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                {STARTERS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleStarterClick(q)}
                    style={{
                      background: 'transparent',
                      border: '0.5px solid var(--border)',
                      borderRadius: '8px',
                      padding: '9px 13px',
                      color: 'var(--text-s)',
                      fontSize: '12px', cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: "'JetBrains Mono', monospace",
                      width: '100%', minHeight: '40px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#00E87B60';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-s)';
                    }}
                  >{q}</button>
                ))}
              </div>
            )}

            {/* Chat messages */}
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--surface-el)',
                  color: m.role === 'user' ? '#0A0A0B' : '#CCC',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '10px 14px',
                  fontSize: '13px', lineHeight: '1.65',
                  maxWidth: '88%',
                  fontWeight: m.role === 'user' ? 500 : 400,
                  animation: 'msgIn 0.3s ease-out',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'var(--surface-el)',
                borderRadius: '14px 14px 14px 4px',
                padding: '12px 16px',
                display: 'flex', gap: '5px', alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--text-m)',
                    animation: `dotBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            id="chat-form"
            onSubmit={e => {
              setStartersVisible(false);
              handleSubmit(e);
            }}
            style={{
              borderTop: '0.5px solid var(--border)',
              padding: '10px 12px',
              display: 'flex', gap: '8px', alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask anything about Jaier…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{
                flex: 1,
                background: 'var(--surface-el)',
                border: '0.5px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--text-p)',
                fontSize: '16px', // prevents iOS zoom
                outline: 'none',
                fontFamily: 'inherit',
                minHeight: '44px',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#00E87B50')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              style={{
                width: '44px', height: '44px',
                borderRadius: '8px', border: 'none',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--surface-el)',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() && !isLoading ? '#0A0A0B' : '#666'}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
