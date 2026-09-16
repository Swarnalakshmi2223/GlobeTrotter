import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileChange = (e) => { setProfileForm({ ...profileForm, [e.target.name]: e.target.value }); setProfileError(''); };
  const handlePasswordChange = (e) => { setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value }); setPasswordError(''); };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) { setProfileError('Name and email are required.'); return; }
    setProfileLoading(true);
    try {
      const res = await profileAPI.update(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { setProfileError(err.message); }
    finally { setProfileLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) { setPasswordError('All fields are required.'); return; }
    if (passwordForm.newPassword.length < 6) { setPasswordError('New password must be at least 6 characters.'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError('New passwords do not match.'); return; }
    setPasswordLoading(true);
    try {
      await profileAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPasswordError(err.message); }
    finally { setPasswordLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      {/* Avatar + Info */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 700, color: 'white', flexShrink: 0
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem' }}>{user?.name}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{user?.email}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
          </div>
        </div>
      </div>

      {/* Profile Update */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
          ✏️ Update Profile
        </h2>
        {profileError && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{profileError}</div>}
        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <input id="profile-name" name="name" type="text" className="form-input" value={profileForm.name} onChange={handleProfileChange} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-email">Email Address</label>
            <input id="profile-email" name="email" type="email" className="form-input" value={profileForm.email} onChange={handleProfileChange} />
          </div>
          <button id="profile-save-btn" type="submit" className="btn btn-primary" disabled={profileLoading} style={{ alignSelf: 'flex-start' }}>
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
          🔑 Change Password
        </h2>
        {passwordError && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{passwordError}</div>}
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="current-password">Current Password</label>
            <input id="current-password" name="currentPassword" type="password" className="form-input" placeholder="Enter current password" value={passwordForm.currentPassword} onChange={handlePasswordChange} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <input id="new-password" name="newPassword" type="password" className="form-input" placeholder="At least 6 characters" value={passwordForm.newPassword} onChange={handlePasswordChange} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
            <input id="confirm-password" name="confirmPassword" type="password" className="form-input" placeholder="Repeat new password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
          </div>
          <button id="password-save-btn" type="submit" className="btn btn-primary" disabled={passwordLoading} style={{ alignSelf: 'flex-start' }}>
            {passwordLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
