import { useEffect, useState } from 'react';
import { getAnimationDefault, getLowPerfDefault } from '../performance';

const STORAGE_KEY = 'arbx:bgAnimations';
const STORAGE_KEY_LOW = 'arbx:bgLowPerf';

export default function AnimationToggle() {
  const [enabled, setEnabled] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === null ? getAnimationDefault() : v === '1';
    } catch {
      return getAnimationDefault();
    }
  });

  const [lowPerf, setLowPerf] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY_LOW);
      return v === null ? getLowPerfDefault() : v === '1';
    } catch {
      return getLowPerfDefault();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch {
      // localStorage can be unavailable in some browser contexts.
    }
    window.dispatchEvent(new CustomEvent('arbx:bgAnimations', { detail: { enabled } }));
  }, [enabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOW, lowPerf ? '1' : '0');
    } catch {
      // localStorage can be unavailable in some browser contexts.
    }
    window.dispatchEvent(new CustomEvent('arbx:bgLowPerf', { detail: { lowPerf } }));
  }, [lowPerf]);

  return (
    <div className="header-controls" aria-label="Controles do painel">
      <button
        aria-pressed={enabled ? 'true' : 'false'}
        className={`anim-toggle ${enabled ? 'on' : 'off'}`}
        onClick={() => setEnabled((value) => !value)}
        title={enabled ? 'Desativar animações do fundo' : 'Ativar animações do fundo'}
      >
        <span className="toggle-dot" aria-hidden="true" />
        <span>Animações</span>
        <strong>{enabled ? 'Ligadas' : 'Desligadas'}</strong>
      </button>

      <button
        aria-pressed={lowPerf ? 'true' : 'false'}
        className={`anim-toggle ${lowPerf ? 'on' : 'off'}`}
        onClick={() => setLowPerf((value) => !value)}
        title={lowPerf ? 'Desativar modo baixa carga' : 'Ativar modo baixa carga'}
      >
        <span className="toggle-dot" aria-hidden="true" />
        <span>Baixa carga</span>
        <strong>{lowPerf ? 'Ativada' : 'Desativada'}</strong>
      </button>
    </div>
  );
}
