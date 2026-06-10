import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, root = null, rootMargin = '0px 0px -8% 0px', threshold = 0.12, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { root, rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold, visible]);

  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}
