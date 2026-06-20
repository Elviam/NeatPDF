import React from 'react';
import { createPortal } from 'react-dom';
import { ClipLoader } from 'react-spinners';

const ButtonDownload = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  icon: Icon,
  iconSize = 18,
  className = '',
  style = {},
  sticky = false,
  ...props
}) => {
  const button = (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: '100%',
        padding: '14px',
        background: loading 
          ? 'rgba(48, 19, 80, 0.57)' 
          : 'var(--purple)',
        border: 'none',
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 400,
        borderRadius: 10,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        
        transition: 'all .25s',
        boxShadow: loading || disabled ? 'none' : '0 ',
        ...style,
      }}
      className={className}
      {...props}
      onMouseEnter={(e) => {
        if (!loading && !disabled) {
          e.currentTarget.style.background = 'var(--purple-medium)';
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 8px 15px rgba(7, 14, 33, 0.70)';
        }
      }}
      onMouseLeave={(e) => {
        if (!loading && !disabled) {
          e.currentTarget.style.background = 'var(--purple)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 10px rgba(7, 14, 33, 0.60)';
        }
      }}
    >
      {loading ? (
        <>
          <ClipLoader color="#ffffff" size={16} />
          {children}
        </>
      ) : (
        <>
          {Icon && <Icon size={iconSize} />}
          {children}
        </>
      )}
    </button>
  );

  if (!sticky) return button;

  const fixedWrapper = (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        padding: '16px clamp(1rem, 4vw, 2rem)',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        background: 'linear-gradient(to top, rgba(5,4,12,.55) 0%, rgba(5,4,12,0) 100%)',
        zIndex: 90,
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto', pointerEvents: 'auto' }}>
        {button}
      </div>
    </div>
  );

  return (
    <>
      {/* Espaciador: reserva espacio en el flujo normal para que el
          contenido final de la página no quede oculto detrás del
          botón, que ahora vive fuera del árbol via portal. */}
      <div style={{ height: 86 }} aria-hidden="true" />
      {createPortal(fixedWrapper, document.body)}
    </>
  );
};

export default ButtonDownload;