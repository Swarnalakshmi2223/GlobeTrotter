import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../api';
import TripCard from '../components/TripCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { isTripUpcoming, isTripOngoing } from '../utils/dateUtils';

const CreateTripModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', budget: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      setError('Trip name, start date, and end date are required.');
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }
    setLoading(true);
    try {
      const res = await tripAPI.create({
        name: form.name.trim(),
        description: form.description.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        budget: form.budget ? parseFloat(form.budget) : 0,
      });
      toast.success('Trip created! ✈️');
      onCreated(res.data.trip);
      onClose();
      setForm({ name: '', description: '', startDate: '', endDate: '', budget: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✈️ Create New Trip"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />Creating...</> : 'Create Trip'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Trip Name *</label>
          <input id="create-trip-name" name="name" type="text" className="form-input" placeholder="e.g. Europe Summer 2025" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" className="form-input" placeholder="What's this trip about?" value={form.description} onChange={handleChange} rows={2} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input id="create-trip-start" name="startDate" type="date" className="form-input" value={form.startDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date *</label>
            <input id="create-trip-end" name="endDate" type="date" className="form-input" value={form.endDate} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Total Budget (USD)</label>
          <input id="create-trip-budget" name="budget" type="number" min="0" step="0.01" className="form-input" placeholder="e.g. 3000" value={form.budget} onChange={handleChange} />
        </div>
      </form>
    </Modal>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await tripAPI.getAll();
        setTrips(res.data.trips || []);
      } catch (err) {
        toast.error('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleTripCreated = (trip) => {
    setTrips((prev) => [trip, ...prev]);
    navigate(`/trips/${trip._id}`);
  };

  const handleTripDeleted = (id) => {
    setTrips((prev) => prev.filter((t) => t._id !== id));
  };

  const filtered = trips.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const upcoming = trips.filter(isTripUpcoming).length;
  const ongoing = trips.filter(isTripOngoing).length;

  if (loading) return <LoadingSpinner text="Loading your trips..." />;

  return (
    <>
      <div className="page-container">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="page-subtitle">Manage your travel adventures</p>
          </div>
          <button id="dashboard-create-trip" className="btn btn-primary btn-lg" onClick={() => setCreateOpen(true)}>
            + New Trip
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-value">{trips.length}</div>
            <div className="stat-card-label">Total Trips</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{upcoming}</div>
            <div className="stat-card-label">Upcoming</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{ongoing}</div>
            <div className="stat-card-label">Ongoing</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{trips.length - upcoming - ongoing}</div>
            <div className="stat-card-label">Completed</div>
          </div>
        </div>

        {/* Search */}
        {trips.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <input
              id="dashboard-search"
              type="text"
              className="form-input"
              placeholder="🔍 Search your trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '400px' }}
            />
          </div>
        )}

        {/* Trips Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="✈️"
            title={search ? 'No trips match your search' : 'No trips yet'}
            description={search ? 'Try a different search term.' : 'Start planning your first adventure!'}
            action={
              !search && (
                <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
                  Create Your First Trip
                </button>
              )
            }
          />
        ) : (
          <div className="trips-grid">
            {filtered.map((trip) => (
              <TripCard key={trip._id} trip={trip} onDeleted={handleTripDeleted} />
            ))}
          </div>
        )}
      </div>

      <CreateTripModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleTripCreated}
      />
    </>
  );
};

export default DashboardPage;
