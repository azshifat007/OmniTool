export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`bg-surface rounded-2xl border border-border p-5 ${className}`}>
      {children}
    </div>
  );
}
