const LoadingSpinner = ({ size = 'md', text }) => {
  const cls = size === 'sm' ? 'spinner spinner-sm' : 'spinner';

  if (text) {
    return (
      <div className="loading-screen">
        <div className={cls} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{text}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div className={cls} />
    </div>
  );
};

export default LoadingSpinner;
