const AuthCard = ({ children, className, title, subtitle, ...props }) => {
  return (
    <div
      className={`relative w-full max-w-md mx-auto p-8 sm:p-10 animate-scale-in ${className || ''}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
      }}
      {...props}
    >
      {/* Logo + Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8 relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                }}
              >
                <span className="text-lg font-black tracking-tight text-white">AU</span>
              </div>
            </div>
          </div>

          {title && (
            <h1 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: '#09090B' }}>
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="text-base" style={{ color: '#71717A' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-6 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
