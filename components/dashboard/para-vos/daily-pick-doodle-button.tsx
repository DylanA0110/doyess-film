'use client';

import * as React from 'react';

type DailyPickDoodleButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const LABEL = 'Tu pick de hoy';

function DoodleLetters() {
  const chars = LABEL.split('');
  return (
    <span className="doodle-text" aria-hidden="true">
      {chars.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="doodle-text-char"
          data-label={char}
          style={{ '--i': index } as React.CSSProperties}
        >
          {char === ' ' ? '\u00a0' : char}
        </span>
      ))}
    </span>
  );
}

export function DailyPickDoodleButton({
  onClick,
  disabled,
  loading,
}: DailyPickDoodleButtonProps) {
  return (
    <div className="doodle-button-wrap">
      <button
        type="button"
        className={`doodle-button${loading ? ' doodle-button--loading' : ''}`}
        onClick={onClick}
        disabled={disabled}
        aria-busy={loading}
        aria-label={loading ? 'Preparando tu pick' : LABEL}
      >
        <div className="doodle-glow" aria-hidden="true" />
        <div className="doodle-bg" aria-hidden="true">
          <div className="doodle-shine" />
        </div>
        <div className="doodle-wave" aria-hidden="true" />
        <div className="doodle-wrap" aria-hidden="true">
          <div className="doodle-circuit" />
          <div className="doodle-wrap-content">
            <div className="doodle-content">
              <div className="doodle-outline" />
              <div className="doodle-glyphs">
                <DoodleLetters />
                <div className="doodle-icon-1" />
                <div className="doodle-icon-2" />
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
