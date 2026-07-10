export default function GlassCard({ children, className = '', accent = false }) {
  return (
    <div className={`bg-surface rounded-2xl border border-border glass-card ${accent ? 'gradient-border' : ''} ${className}`}>
      {accent && <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-primary to-accent opacity-60" />}
      <div className={accent ? 'p-5' : 'p-5'}>
        {children}
      </div>
    </div>
  );
}
