import { useCallback, useEffect, useRef, useState } from 'react';

const THRESHOLD = 4;
const EDGE = 8;

// for draggable floating items: pos is the distance from the parent's right/bottom edges, back to initial on reload
export default function useDragPosition(ref, { initial, size }) {
  const [pos, setPos] = useState(initial);
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const moved = useRef(false);

  const clamp = useCallback((p, a) => ({
    x: Math.min(Math.max(p.x, EDGE), Math.max(a.w - size - EDGE, EDGE)),
    y: Math.min(Math.max(p.y, EDGE), Math.max(a.h - size - EDGE, EDGE)),
  }), [size]);

  useEffect(() => {
    const parent = ref.current?.offsetParent;
    if (!parent) return undefined;
    const measure = () => {
      const a = { w: parent.clientWidth, h: parent.clientHeight };
      setArea(a);
      setPos((p) => clamp(p, a));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [ref, clamp]);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, start: pos };
    moved.current = false;
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (!moved.current && Math.hypot(dx, dy) < THRESHOLD) return;
    moved.current = true;
    setDragging(true);
    setPos(clamp({ x: drag.current.start.x - dx, y: drag.current.start.y - dy }, area));
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
  };

  // for click handlers: true right after a drag so the drop doesn't count as a click
  const wasDragged = () => {
    const was = moved.current;
    moved.current = false;
    return was;
  };

  return {
    pos,
    area,
    dragging,
    wasDragged,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
