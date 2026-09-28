const BRAND_INITIALS: Record<string, string> = {
  'Mercedes-Benz': 'MB',
  Volkswagen: 'VW',
};

interface BrandAvatarProps {
  brand: string;
  size?: 'md' | 'lg';
}

export function BrandAvatar({ brand, size = 'md' }: BrandAvatarProps) {
  const initials = BRAND_INITIALS[brand] ?? brand.slice(0, 2).toUpperCase();
  const sizeClass = size === 'lg' ? 'h-14 w-14 text-base' : 'h-11 w-11 text-xs';

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold tracking-tight text-fg`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
