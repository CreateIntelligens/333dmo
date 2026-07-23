import type { ReactNode, SVGProps } from 'react';

export type IconName =
  | 'activity'
  | 'bar-chart-3'
  | 'calendar-clock'
  | 'chevron-down'
  | 'clock-3'
  | 'layout-dashboard'
  | 'moon'
  | 'radio'
  | 'refresh-cw'
  | 'sun'
  | 'users'
  | 'wrench';

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, ReactNode> = {
  activity: (
    <>
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    </>
  ),
  'bar-chart-3': (
    <>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </>
  ),
  'calendar-clock': (
    <>
      <path d="M8 2v4M16 2v4M3 10h14" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 14v3l2 1" />
      <circle cx="16" cy="16" r="4" />
    </>
  ),
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'clock-3': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  'layout-dashboard': (
    <>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </>
  ),
  moon: (
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
  ),
  radio: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19a10 10 0 0 1 0-14" />
    </>
  ),
  'refresh-cw': (
    <>
      <path d="M3 12a9 9 0 0 1 15.2-6.5L21 7" />
      <path d="M21 3v4h-4M21 12a9 9 0 0 1-15.2 6.5L3 17" />
      <path d="M3 21v-4h4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  wrench: (
    <>
      <path d="M14.7 6.3a4.8 4.8 0 0 0-6.4-3.7l2.4 2.4-3 3-2.4-2.4a4.8 4.8 0 0 0 3.7 6.4L16 19a2.1 2.1 0 0 0 3-3Z" />
      <path d="m15 9 3-3" />
    </>
  ),
};

export function Icon({ name, size = 18, strokeWidth = 1.8, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
