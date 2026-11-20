import { cn } from '@/lib/utils';

// for eye follow: pupils shift by --look-x / --look-y set on any parent
const LOOK = { transform: 'translate(var(--look-x, 0px), var(--look-y, 0px))' };
const SKIN = 'transition-[fill,stroke] duration-500 motion-reduce:transition-none';

// tone: skin color; blinkKey: change it to replay the blink
export default function Chameleon({ tone, blinkKey = 0, className }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('overflow-visible', className)} aria-hidden>
      <path d="M45 50 Q59 50 57 40 Q55 32 48 35 Q44 38 49 41" fill="none" stroke={tone} strokeWidth="5" strokeLinecap="round" className={SKIN} />
      <ellipse cx="31" cy="45" rx="16" ry="11.5" fill={tone} className={SKIN} />
      <ellipse cx="31" cy="48" rx="10" ry="6" fill="#fff" opacity=".22" />
      <ellipse cx="22" cy="56.5" rx="3.6" ry="2" fill="#101010" opacity=".55" />
      <ellipse cx="40" cy="56.5" rx="3.6" ry="2" fill="#101010" opacity=".55" />
      <path d="M11 29 Q11 13 31 11 Q49 11 50 28 Q50 40 31 40 Q11 40 11 29Z" fill={tone} className={SKIN} />
      <path d="M23 12.5 Q31 3 39 12.5" fill="#101010" opacity=".28" />
      <circle cx="31" cy="20" r="2" fill="#fff" opacity=".35" />
      <circle cx="36" cy="23" r="1.4" fill="#fff" opacity=".35" />
      <circle cx="18" cy="27" r="8.6" fill={tone} stroke="#101010" strokeOpacity=".25" strokeWidth="1.4" className={SKIN} />
      <circle cx="43" cy="27" r="8.6" fill={tone} stroke="#101010" strokeOpacity=".25" strokeWidth="1.4" className={SKIN} />
      <g
        key={blinkKey}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        className={cn(blinkKey > 0 && 'animate-cham-blink motion-reduce:animate-none')}
      >
        <circle cx="18" cy="27" r="5.6" fill="#fff" />
        <circle cx="43" cy="27" r="5.6" fill="#fff" />
        <g className="transition-transform duration-150 ease-out" style={LOOK}>
          <circle cx="18" cy="27" r="2.8" fill="#101010" />
          <circle cx="43" cy="27" r="2.8" fill="#101010" />
          <circle cx="19" cy="26" r=".9" fill="#fff" />
          <circle cx="44" cy="26" r=".9" fill="#fff" />
        </g>
      </g>
      <path d="M25 34 Q31 37.5 37 34" fill="none" stroke="#101010" strokeOpacity=".55" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
