import { useEffect } from 'react';

const REACH = 240;

// for the chameleon eyes: writes --look-x / --look-y on the element so pupils follow the pointer without re-rendering
export default function useEyeFollow(ref, maxShift = 1.5) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    let point = null;

    const apply = () => {
      frame = 0;
      const el = ref.current;
      if (!el || !point) return;
      const box = el.getBoundingClientRect();
      const dx = point.x - (box.left + box.width / 2);
      const dy = point.y - (box.top + box.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const shift = Math.min(dist / REACH, 1) * maxShift;
      el.style.setProperty('--look-x', `${(dx / dist) * shift}px`);
      el.style.setProperty('--look-y', `${(dy / dist) * shift}px`);
    };

    const onMove = (e) => {
      point = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      point = null;
      ref.current?.style.setProperty('--look-x', '0px');
      ref.current?.style.setProperty('--look-y', '0px');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [ref, maxShift]);
}
