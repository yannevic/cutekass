import { useState, useEffect } from 'react';

const icon = new URL('../../assets/cutekass.png', import.meta.url).href;

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.electronAPI.getVersion().then(setVersion);
  }, []);

  function handleMinimize() {
    window.electronAPI.winMinimize();
  }
  function handleMaximize() {
    window.electronAPI.winMaximize();
    setIsMaximized((v) => !v);
  }
  function handleClose() {
    window.electronAPI.winClose();
  }

  return (
    <div
      style={
        {
          height: 38,
          background: 'linear-gradient(90deg, #0B0F1A 0%, #1E0A38 50%, #0B0F1A 100%)',
          borderBottom: '1.5px solid #3B136B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '0.75rem',
          paddingRight: '0.5rem',
          WebkitAppRegion: 'drag',
          userSelect: 'none',
          flexShrink: 0,
          zIndex: 9999,
          position: 'relative',
        } as React.CSSProperties
      }
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img
          src={icon}
          alt="CuteKass"
          style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 4 }}
        />
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#CFA6FF',
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ color: '#D94BFF' }}>Cute</span>Kass
        </span>
      </div>

      {/* Versão + botões */}
      <div
        style={
          {
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties
        }
      >
        {version && (
          <span
            style={{
              fontSize: 9,
              color: '#7B2CF5',
              fontFamily: 'Space Grotesk, sans-serif',
              marginRight: 4,
              opacity: 0.8,
            }}
          >
            v{version}
          </span>
        )}

        <TitleBtn color="#5A1FA8" onClick={handleMinimize} title="minimizar">
          <span style={{ fontSize: 10, lineHeight: 1, marginBottom: 2, display: 'block' }}>—</span>
        </TitleBtn>

        <TitleBtn
          color="#7B2CF5"
          onClick={handleMaximize}
          title={isMaximized ? 'restaurar' : 'maximizar'}
        >
          <span style={{ fontSize: 9, lineHeight: 1, display: 'block' }}>
            {isMaximized ? '❐' : '□'}
          </span>
        </TitleBtn>

        <TitleBtn color="#A23CFF" onClick={handleClose} title="fechar">
          <span style={{ fontSize: 11, lineHeight: 1, display: 'block' }}>✕</span>
        </TitleBtn>
      </div>
    </div>
  );
}

function TitleBtn({
  color,
  onClick,
  title,
  children,
}: {
  color: string;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 26,
        height: 26,
        borderRadius: 7,
        border: 'none',
        background: color,
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.15s',
        flexShrink: 0,
        fontFamily: 'Space Grotesk, sans-serif',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = '0.75';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = '1';
      }}
    >
      {children}
    </button>
  );
}
