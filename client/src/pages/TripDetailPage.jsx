import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { tripAPI, cityAPI, activityAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import BudgetBar from '../components/BudgetBar';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { formatDate, formatCurrency, toInputDate, daysBetween } from '../utils/dateUtils';

// ===================== EDIT TRIP MODAL =====================
const EditTripModal = ({ isOpen, onClose, trip, onUpdated }) => {
  const [form, setForm] = useState({
    name: trip?.name || '', description: trip?.description || '',
    startDate: toInputDate(trip?.startDate), endDate: toInputDate(trip?.endDate),
    budget: trip?.budget || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip) {
      setForm({ name: trip.name, description: trip.description || '', startDate: toInputDate(trip.startDate), endDate: toInputDate(trip.endDate), budget: trip.budget || 0 });
    }
  }, [trip]);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.endDate) { setError('Name, start date, and end date required.'); return; }
    if (new Date(form.startDate) > new Date(form.endDate)) { setError('Start date cannot be after end date.'); return; }
    setLoading(true);
    try {
      const res = await tripAPI.update(trip._id, { ...form, budget: Number.parseFloat(form.budget) || 0 });
      onUpdated(res.data.trip);
      toast.success('Trip updated!');
      onClose();
    } catch (err) {
      console.error('Trip update error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Edit Trip"
      footer={<><button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button></>}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group"><label className="form-label" htmlFor="edit-trip-name">Trip Name *</label><input id="edit-trip-name" name="name" type="text" className="form-input" value={form.name} onChange={handleChange} /></div>
        <div className="form-group"><label className="form-label" htmlFor="edit-trip-desc">Description</label><textarea id="edit-trip-desc" name="description" className="form-input" value={form.description} onChange={handleChange} rows={2} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group"><label className="form-label" htmlFor="edit-trip-start">Start Date *</label><input id="edit-trip-start" name="startDate" type="date" className="form-input" value={form.startDate} onChange={handleChange} /></div>
          <div className="form-group"><label className="form-label" htmlFor="edit-trip-end">End Date *</label><input id="edit-trip-end" name="endDate" type="date" className="form-input" value={form.endDate} onChange={handleChange} /></div>
        </div>
        <div className="form-group"><label className="form-label" htmlFor="edit-trip-budget">Budget (USD)</label><input id="edit-trip-budget" name="budget" type="number" min="0" step="0.01" className="form-input" value={form.budget} onChange={handleChange} /></div>
      </form>
    </Modal>
  );
};

// ===================== CITY MODAL =====================
const CityModal = ({ isOpen, onClose, tripId, trip, city, onSaved }) => {
  const editing = !!city;
  const [form, setForm] = useState({ cityName: '', arrivalDate: '', departureDate: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (city) setForm({ cityName: city.cityName, arrivalDate: toInputDate(city.arrivalDate), departureDate: toInputDate(city.departureDate), notes: city.notes || '' });
    else setForm({ cityName: '', arrivalDate: toInputDate(trip?.startDate), departureDate: toInputDate(trip?.endDate), notes: '' });
  }, [city, trip, isOpen]);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cityName.trim() || !form.arrivalDate || !form.departureDate) { setError('City name, arrival and departure dates are required.'); return; }
    if (new Date(form.arrivalDate) > new Date(form.departureDate)) { setError('Arrival date cannot be after departure date.'); return; }
    setLoading(true);
    try {
      let res;
      if (editing) res = await cityAPI.update(city._id, form);
      else res = await cityAPI.add({ tripId, ...form });
      onSaved(res.data.city, editing);
      toast.success(editing ? 'Destination updated!' : 'Destination added! 📍');
      onClose();
    } catch (err) {
      console.error('City save error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  let cityBtnText = 'Add Destination';
  if (loading) cityBtnText = 'Saving...';
  else if (editing) cityBtnText = 'Save Changes';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? '✏️ Edit Destination' : '📍 Add Destination'}
      footer={<><button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{cityBtnText}</button></>}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group"><label className="form-label" htmlFor="city-name-input">City Name *</label><input id="city-name-input" name="cityName" type="text" className="form-input" placeholder="e.g. Paris, Tokyo, New York" value={form.cityName} onChange={handleChange} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group"><label className="form-label" htmlFor="city-arrival-date">Arrival Date *</label><input id="city-arrival-date" name="arrivalDate" type="date" className="form-input" value={form.arrivalDate} onChange={handleChange} /></div>
          <div className="form-group"><label className="form-label" htmlFor="city-departure-date">Departure Date *</label><input id="city-departure-date" name="departureDate" type="date" className="form-input" value={form.departureDate} onChange={handleChange} /></div>
        </div>
        <div className="form-group"><label className="form-label" htmlFor="city-notes">Notes</label><textarea id="city-notes" name="notes" className="form-input" placeholder="Any notes about this stop..." value={form.notes} onChange={handleChange} rows={2} /></div>
      </form>
    </Modal>
  );
};

// ===================== ACTIVITY MODAL =====================
const ActivityModal = ({ isOpen, onClose, tripId, cities, activity, defaultCityId, onSaved }) => {
  const editing = !!activity;
  const [form, setForm] = useState({ name: '', description: '', date: '', time: '', location: '', cost: '', notes: '', cityId: defaultCityId || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activity) setForm({ name: activity.name, description: activity.description || '', date: toInputDate(activity.date), time: activity.time || '', location: activity.location || '', cost: activity.cost || '', notes: activity.notes || '', cityId: activity.cityId });
    else setForm({ name: '', description: '', date: '', time: '', location: '', cost: '', notes: '', cityId: defaultCityId || (cities[0]?._id || '') });
  }, [activity, defaultCityId, cities, isOpen]);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date || !form.cityId) { setError('Activity name, date, and destination are required.'); return; }
    if (form.cost !== '' && Number.parseFloat(form.cost) < 0) { setError('Cost must be a non-negative value.'); return; }
    setLoading(true);
    try {
      let res;
      const payload = { ...form, tripId, cost: form.cost !== '' ? Number.parseFloat(form.cost) : 0 };
      if (editing) res = await activityAPI.update(activity._id, payload);
      else res = await activityAPI.create(payload);
      onSaved(res.data.activity, editing);
      toast.success(editing ? 'Activity updated!' : 'Activity added! 🎯');
      onClose();
    } catch (err) {
      console.error('Activity save error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  let actBtnText = 'Add Activity';
  if (loading) actBtnText = 'Saving...';
  else if (editing) actBtnText = 'Save Changes';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? '✏️ Edit Activity' : '🎯 Add Activity'}
      footer={<><button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{actBtnText}</button></>}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group"><label className="form-label" htmlFor="activity-destination">Destination *</label>
          <select id="activity-destination" name="cityId" className="form-input" value={form.cityId} onChange={handleChange}>
            <option value="">Select destination...</option>
            {cities.map((c) => <option key={c._id} value={c._id}>{c.cityName}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label" htmlFor="activity-name-input">Activity Name *</label><input id="activity-name-input" name="name" type="text" className="form-input" placeholder="e.g. Eiffel Tower Visit" value={form.name} onChange={handleChange} /></div>
        <div className="form-group"><label className="form-label" htmlFor="activity-description">Description</label><textarea id="activity-description" name="description" className="form-input" placeholder="What will you do?" value={form.description} onChange={handleChange} rows={2} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group"><label className="form-label" htmlFor="activity-date">Date *</label><input id="activity-date" name="date" type="date" className="form-input" value={form.date} onChange={handleChange} /></div>
          <div className="form-group"><label className="form-label" htmlFor="activity-time">Time</label><input id="activity-time" name="time" type="time" className="form-input" value={form.time} onChange={handleChange} /></div>
        </div>
        <div className="form-group"><label className="form-label" htmlFor="activity-location">Location</label><input id="activity-location" name="location" type="text" className="form-input" placeholder="Address or landmark" value={form.location} onChange={handleChange} /></div>
        <div className="form-group"><label className="form-label" htmlFor="activity-cost">Estimated Cost (USD)</label><input id="activity-cost" name="cost" type="number" min="0" step="0.01" className="form-input" placeholder="0" value={form.cost} onChange={handleChange} /></div>
        <div className="form-group"><label className="form-label" htmlFor="activity-notes">Notes</label><textarea id="activity-notes" name="notes" className="form-input" placeholder="Any additional notes" value={form.notes} onChange={handleChange} rows={2} /></div>
      </form>
    </Modal>
  );
};

// ===================== TIMELINE VIEW =====================
const TimelineView = ({ cities, activities }) => {
  const allEvents = [
    ...cities.map((c) => ({ ...c, _type: 'city', _sortDate: new Date(c.arrivalDate) })),
    ...activities.map((a) => ({ ...a, _type: 'activity', _sortDate: new Date(a.date) })),
  ].sort((a, b) => a._sortDate - b._sortDate);

  if (allEvents.length === 0) return <EmptyState icon="📅" title="No events yet" description="Add destinations and activities to see your timeline." />;

  return (
    <div className="timeline-container">
      <div className="timeline-line" />
      {allEvents.map((event) =>
        event._type === 'city' ? (
          <div key={event._id} className="timeline-item">
            <div className="timeline-dot city" />
            <div className="timeline-content">
              <div className="timeline-label city">📍 Destination</div>
              <div className="timeline-title">{event.cityName}</div>
              <div className="timeline-date">
                {formatDate(event.arrivalDate)} → {formatDate(event.departureDate)}
                <span style={{ marginLeft: '10px', color: 'var(--color-text-muted)' }}>
                  ({daysBetween(event.arrivalDate, event.departureDate)} days)
                </span>
              </div>
              {event.notes && <p style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{event.notes}</p>}
            </div>
          </div>
        ) : (
          <div key={event._id} className="timeline-item" style={{ marginLeft: '20px' }}>
            <div className="timeline-dot activity" />
            <div className="timeline-content">
              <div className="timeline-label activity">🎯 Activity</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="timeline-title" style={{ fontSize: '0.95rem' }}>{event.name}</div>
                {event.cost > 0 && <span style={{ color: 'var(--color-amber-400)', fontWeight: 600, fontSize: '0.85rem' }}>{formatCurrency(event.cost)}</span>}
              </div>
              <div className="timeline-date">
                {formatDate(event.date)} {event.time && `· ${event.time}`}
                {event.location && <span style={{ marginLeft: '10px' }}>📌 {event.location}</span>}
              </div>
              {event.description && <p style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{event.description}</p>}
            </div>
          </div>
        )
      )}
    </div>
  );
};

// ===================== BUDGET VIEW =====================
const BudgetView = ({ budget, loading }) => {
  if (loading) return <LoadingSpinner />;
  if (!budget) return <EmptyState icon="💰" title="No budget data" description="Add activities with costs to see your budget breakdown." />;

  return (
    <div>
      <BudgetBar budget={budget} />
      {budget.breakdown?.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cost by Destination
          </h4>
          {budget.breakdown.map((b) => (
            <div key={b.cityId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(7,13,26,0.5)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>📍 {b.cityName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{b.activityCount} {b.activityCount === 1 ? 'activity' : 'activities'}</div>
              </div>
              <div style={{ color: 'var(--color-amber-400)', fontWeight: 700, fontSize: '1rem' }}>{formatCurrency(b.totalCost)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================== ACTIVITY ITEM =====================
const ActivityItem = ({ act, onEdit, onDelete }) => (
  <div className="activity-item">
    <div className="activity-dot" />
    <div style={{ flex: 1 }}>
      <div className="activity-name">{act.name}</div>
      <div className="activity-meta">
        📅 {formatDate(act.date)}{act.time && ` · ⏰ ${act.time}`}
        {act.location && <span>📌 {act.location}</span>}
        {act.description && <span style={{ display: 'block', width: '100%', marginTop: '2px' }}>{act.description}</span>}
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
      {act.cost > 0 && <span className="activity-cost">{formatCurrency(act.cost)}</span>}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={() => onEdit(act)}
          title="Edit activity"
          aria-label="Edit activity"
        >
          ✏️
        </button>
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={() => onDelete(act)}
          title="Delete activity"
          aria-label="Delete activity"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
);

// ===================== MAIN TRIP DETAIL PAGE =====================
const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [trip, setTrip] = useState(null);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('destinations');

  // Modal states
  const [editTripOpen, setEditTripOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [defaultCityId, setDefaultCityId] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', item: null });
  const [deleting, setDeleting] = useState(false);

  const handleEditActivity = useCallback((act) => {
    setEditingActivity(act);
    setActivityModalOpen(true);
  }, []);

  const handleDeleteActivity = useCallback((act) => {
    setDeleteConfirm({ open: true, type: 'activity', item: act });
  }, []);

  const handleOpenAddActivity = useCallback((cityId) => {
    setEditingActivity(null);
    setDefaultCityId(cityId || '');
    setActivityModalOpen(true);
  }, []);

  const fetchBudget = useCallback(async () => {
    setBudgetLoading(true);
    try {
      const res = await activityAPI.getBudget(id);
      setBudget(res.data.budget);
    } catch {
      setBudget(null);
    } finally {
      setBudgetLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await tripAPI.getById(id);
        setTrip(res.data.trip);
        setCities(res.data.cities || []);
        setActivities(res.data.activities || []);
      } catch (err) {
        console.error('Failed to load trip:', err);
        toast.error('Trip not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  useEffect(() => {
    if (trip) fetchBudget();
  }, [trip, activities, fetchBudget]);

  // Open edit modal if ?edit=true
  useEffect(() => {
    if (searchParams.get('edit') === 'true' && trip) setEditTripOpen(true);
  }, [searchParams, trip]);

  const handleCitySaved = (city, wasEditing) => {
    if (wasEditing) setCities((prev) => prev.map((c) => (c._id === city._id ? city : c)));
    else setCities((prev) => [...prev, city].sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate)));
  };

  const handleActivitySaved = (activity, wasEditing) => {
    if (wasEditing) setActivities((prev) => prev.map((a) => (a._id === activity._id ? activity : a)));
    else setActivities((prev) => [...prev, activity].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const handleDeleteConfirm = async () => {
    const { type, item } = deleteConfirm;
    setDeleting(true);
    try {
      if (type === 'city') {
        await cityAPI.delete(item._id);
        setCities((prev) => prev.filter((c) => c._id !== item._id));
        setActivities((prev) => prev.filter((a) => a.cityId !== item._id));
        toast.success('Destination deleted');
      } else if (type === 'activity') {
        await activityAPI.delete(item._id);
        setActivities((prev) => prev.filter((a) => a._id !== item._id));
        toast.success('Activity deleted');
      } else if (type === 'trip') {
        await tripAPI.delete(item._id);
        toast.success('Trip deleted');
        navigate('/dashboard');
        return;
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteConfirm({ open: false, type: '', item: null });
    }
  };

  const getActivitiesForCity = (cityId) => activities.filter((a) => a.cityId === cityId?.toString() || a.cityId?._id === cityId);

  if (loading) return <LoadingSpinner text="Loading trip details..." />;
  if (!trip) return null;

  const tabs = [
    { id: 'destinations', label: '📍 Destinations', count: cities.length },
    { id: 'activities', label: '🎯 Activities', count: activities.length },
    { id: 'budget', label: '💰 Budget' },
    { id: 'timeline', label: '📅 Timeline' },
  ];

  let activitiesContent = null;
  if (cities.length === 0) {
    activitiesContent = (
      <div className="alert alert-warning">⚠️ Add a destination first before adding activities.</div>
    );
  } else if (activities.length === 0) {
    activitiesContent = (
      <EmptyState
        icon="🎯"
        title="No activities yet"
        description="Plan what you'll do at each destination."
        action={<button className="btn btn-primary" onClick={() => handleOpenAddActivity(cities[0]?._id || '')}>Add Activity</button>}
      />
    );
  } else {
    activitiesContent = cities.map((city) => {
      const cityActs = getActivitiesForCity(city._id);
      if (cityActs.length === 0) return null;
      return (
        <div key={city._id} className="section-card">
          <div className="section-card-header">
            <h3 className="section-card-title">📍 {city.cityName}</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleOpenAddActivity(city._id)}
            >
              + Activity
            </button>
          </div>
          {cityActs.map((act) => (
            <ActivityItem
              key={act._id}
              act={act}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
            />
          ))}
        </div>
      );
    });
  }

  return (
    <>
      <div className="page-container">
        {/* Back button */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ marginBottom: '16px' }}>
          ← Back to Dashboard
        </button>

        {/* Trip Hero */}
        <div className="trip-hero">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '6px' }}>
                {trip.name}
              </h1>
              {trip.description && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0' }}>{trip.description}</p>}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditTripOpen(true)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm({ open: true, type: 'trip', item: trip })}>🗑️ Delete</button>
            </div>
          </div>
          <div className="trip-hero-meta">
            <div className="trip-hero-stat">📅 <strong>{formatDate(trip.startDate)}</strong> → <strong>{formatDate(trip.endDate)}</strong></div>
            <div className="trip-hero-stat">⏱️ <strong>{daysBetween(trip.startDate, trip.endDate)}</strong> days</div>
            <div className="trip-hero-stat">💰 Budget: <strong>{formatCurrency(trip.budget)}</strong></div>
            <div className="trip-hero-stat">📍 <strong>{cities.length}</strong> destinations</div>
            <div className="trip-hero-stat">🎯 <strong>{activities.length}</strong> activities</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((tab) => (
            <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
              {tab.count !== undefined && (
                <span style={{ background: activeTab === tab.id ? 'rgba(20,184,166,0.2)' : 'rgba(148,163,184,0.1)', borderRadius: '999px', padding: '1px 7px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ---- DESTINATIONS TAB ---- */}
        {activeTab === 'destinations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button id="add-destination-btn" className="btn btn-primary" onClick={() => { setEditingCity(null); setCityModalOpen(true); }}>
                + Add Destination
              </button>
            </div>
            {cities.length === 0 ? (
              <EmptyState icon="📍" title="No destinations yet" description="Add your first city stop to start building your itinerary." action={<button className="btn btn-primary" onClick={() => setCityModalOpen(true)}>Add Destination</button>} />
            ) : (
              cities.map((city) => (
                <div key={city._id} className="city-card animate-fade-in">
                  <div className="city-card-header">
                    <div className="city-name">🏙️ {city.cityName}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditingCity(city); setCityModalOpen(true); }}>✏️</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setDeleteConfirm({ open: true, type: 'city', item: city })}>🗑️</button>
                    </div>
                  </div>
                  <div className="city-dates">
                    <span>✈️ Arrives: {formatDate(city.arrivalDate)}</span>
                    <span>🛫 Departs: {formatDate(city.departureDate)}</span>
                    <span>⏱️ {daysBetween(city.arrivalDate, city.departureDate)} days</span>
                  </div>
                  {city.notes && <p className="city-notes">💬 {city.notes}</p>}

                  {/* Mini activity list under city */}
                  {(() => {
                    const cityActs = getActivitiesForCity(city._id);
                    return cityActs.length > 0 && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                          {cityActs.length} {cityActs.length === 1 ? 'Activity' : 'Activities'}
                        </div>
                        {cityActs.map((act) => (
                          <div key={act._id} className="activity-item">
                            <div className="activity-dot" />
                            <div style={{ flex: 1 }}>
                              <div className="activity-name">{act.name}</div>
                              <div className="activity-meta">
                                {formatDate(act.date)}{act.time && ` · ${act.time}`}
                                {act.location && <span>📌 {act.location}</span>}
                              </div>
                            </div>
                            {act.cost > 0 && <span className="activity-cost">{formatCurrency(act.cost)}</span>}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ))
            )}
          </div>
        )}

        {/* ---- ACTIVITIES TAB ---- */}
        {activeTab === 'activities' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                id="add-activity-btn"
                className="btn btn-primary"
                disabled={cities.length === 0}
                title={cities.length === 0 ? 'Add a destination first' : ''}
                onClick={() => handleOpenAddActivity(cities[0]?._id || '')}
              >
                + Add Activity
              </button>
            </div>
            {activitiesContent}
          </div>
        )}

        {/* ---- BUDGET TAB ---- */}
        {activeTab === 'budget' && (
          <div className="section-card">
            <h3 className="section-card-title" style={{ marginBottom: '20px' }}>💰 Budget Overview</h3>
            <BudgetView budget={budget} loading={budgetLoading} />
          </div>
        )}

        {/* ---- TIMELINE TAB ---- */}
        {activeTab === 'timeline' && (
          <div className="section-card">
            <h3 className="section-card-title" style={{ marginBottom: '20px' }}>📅 Trip Timeline</h3>
            <TimelineView cities={cities} activities={activities} />
          </div>
        )}
      </div>

      {/* Modals */}
      <EditTripModal isOpen={editTripOpen} onClose={() => setEditTripOpen(false)} trip={trip} onUpdated={(t) => setTrip(t)} />
      <CityModal isOpen={cityModalOpen} onClose={() => { setCityModalOpen(false); setEditingCity(null); }} tripId={id} trip={trip} city={editingCity} onSaved={handleCitySaved} />
      <ActivityModal isOpen={activityModalOpen} onClose={() => { setActivityModalOpen(false); setEditingActivity(null); }} tripId={id} cities={cities} activity={editingActivity} defaultCityId={defaultCityId} onSaved={handleActivitySaved} />
      {(() => {
        let deleteTitle = 'Delete Activity';
        let deleteMessage = `Delete "${deleteConfirm.item?.name}"?`;
        let deleteConfirmText = 'Delete Activity';
        if (deleteConfirm.type === 'trip') {
          deleteTitle = 'Delete Trip';
          deleteMessage = `Delete "${deleteConfirm.item?.name}"? All destinations and activities will be permanently removed.`;
          deleteConfirmText = 'Delete Trip';
        } else if (deleteConfirm.type === 'city') {
          deleteTitle = 'Delete Destination';
          deleteMessage = `Delete "${deleteConfirm.item?.cityName}"? All activities in this destination will also be removed.`;
          deleteConfirmText = 'Delete Destination';
        }
        return (
          <ConfirmDialog
            isOpen={deleteConfirm.open}
            onClose={() => setDeleteConfirm({ open: false, type: '', item: null })}
            onConfirm={handleDeleteConfirm}
            loading={deleting}
            title={deleteTitle}
            message={deleteMessage}
            confirmText={deleteConfirmText}
          />
        );
      })()}
    </>
  );
};

export default TripDetailPage;
