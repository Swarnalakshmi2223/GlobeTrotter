import { useNavigate } from 'react-router-dom';
import { formatDate, formatShortDate, daysBetween, getTripStatus, formatCurrency } from '../utils/dateUtils';
import ConfirmDialog from './ConfirmDialog';
import { useState } from 'react';
import { tripAPI } from '../api';
import toast from 'react-hot-toast';

const TripCard = ({ trip, onDeleted }) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const status = getTripStatus(trip);
  const duration = daysBetween(trip.startDate, trip.endDate);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tripAPI.delete(trip._id);
      toast.success('Trip deleted successfully');
      onDeleted?.(trip._id);
    } catch (err) {
      toast.error(err.message || 'Failed to delete trip');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="trip-card animate-fade-in" onClick={() => navigate(`/trips/${trip._id}`)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h3 className="trip-card-name">{trip.name}</h3>
          <span className={`badge ${status.cls}`}>{status.label}</span>
        </div>

        <div className="trip-card-dates">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {formatShortDate(trip.startDate)} – {formatDate(trip.endDate)} · {duration} days
        </div>

        {trip.description && (
          <p className="trip-card-desc">{trip.description}</p>
        )}

        <div className="trip-card-budget">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
          Budget: <strong>{formatCurrency(trip.budget)}</strong>
        </div>

        <div className="trip-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            onClick={() => navigate(`/trips/${trip._id}`)}
          >
            View Details
          </button>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => navigate(`/trips/${trip._id}?edit=true`)}
            title="Edit trip"
          >
            ✏️
          </button>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => setConfirmOpen(true)}
            title="Delete trip"
          >
            🗑️
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Trip"
        message={`Are you sure you want to delete "${trip.name}"? This will permanently remove the trip along with all its destinations and activities.`}
        confirmText="Delete Trip"
      />
    </>
  );
};

export default TripCard;
