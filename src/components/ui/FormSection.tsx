interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section aria-label={title} style={{ paddingTop: 32 }}>
      <h2
        style={{
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: 22,
          color: '#1a1a1a',
          letterSpacing: '-0.02em',
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </section>
  );
}
