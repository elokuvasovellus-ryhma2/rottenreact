

export function ProfileInfo({ user }) {
  return (
    <div className="profile-info">
      <div className="info-card">
        <h3>Account Information</h3>
        <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
 
      </div>
    </div>
  );
}
