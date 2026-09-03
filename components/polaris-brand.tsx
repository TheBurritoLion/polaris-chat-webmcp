import { platformMeta, type SourcePlatform } from "@/lib/polaris-demo";

export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <span className="polaris-brand-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 40 40" role="img">
        <path d="M20 3.5 23.4 16.6 36.5 20l-13.1 3.4L20 36.5l-3.4-13.1L3.5 20l13.1-3.4L20 3.5Z" />
        <circle cx="20" cy="20" r="2.4" />
      </svg>
    </span>
  );
}

export function PlatformMark({
  platform,
  compact = false,
}: {
  platform: SourcePlatform;
  compact?: boolean;
}) {
  const meta = platformMeta[platform];
  return (
    <span
      className="platform-mark"
      data-platform={platform}
      style={{ "--platform-color": meta.color, "--platform-soft": meta.soft } as React.CSSProperties}
      aria-label={meta.label}
      title={meta.label}
    >
      <span className="platform-mark-badge" aria-hidden="true">{meta.short}</span>
      {!compact ? <span>{meta.label}</span> : null}
    </span>
  );
}

