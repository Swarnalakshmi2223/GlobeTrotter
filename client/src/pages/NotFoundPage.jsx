import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '24px' }}>
      <div style={{ fontSize: '5rem' }}>🗺️</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '4rem', fontWeight: 800, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>
        404
      </h1>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-text-primary)', margin: 0 }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '320px' }}>
        Looks like this destination doesn't exist on your itinerary. Let's get you back on track!
      </p>
      <Link to="/dashboard" className="btn btn-primary btn-lg">
        ← Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
