import { useEffect, useState } from 'react';

const EMAIL = 'hello@slctechpulse.com';

interface SubmitDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  intro: string;
  checklist: string[];
  mailtoSubject: string;
}

export function SubmitDialog({
  open,
  onClose,
  title,
  intro,
  checklist,
  mailtoSubject,
}: SubmitDialogProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(mailtoSubject)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '460px',
          width: '100%',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            lineHeight: 1.6,
            margin: '0 0 12px',
          }}
        >
          {intro}
        </p>

        <ul
          style={{
            color: 'var(--text-primary)',
            fontSize: '13px',
            lineHeight: 1.7,
            margin: '0 0 20px',
            paddingLeft: '18px',
          }}
        >
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: '13px',
              color: 'var(--text-primary)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            {EMAIL}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-mid)',
              color: copied ? 'var(--success)' : 'var(--accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <a
          href={mailto}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            background: 'var(--accent-solid)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Open in mail app
        </a>
      </div>
    </div>
  );
}
