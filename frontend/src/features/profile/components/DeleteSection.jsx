import './DeleteSection.css';

export function DeleteSection({ user }) {
  const API_BASE = (import.meta.env.VITE_API_URL)

  const deleteAccount = async (userId) => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      alert('You must be logged in to delete your account.');
      return;
    }
    if (!userId) {
      alert('User ID missing.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete your account?')) {
      return;
    }

    try {
      const url = `${API_BASE}/users/delete/${userId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json')
        ? await response.json()
        : null; 
      if (!response.ok) {
        alert((payload && payload.error) || `Failed to delete account (${response.status}).`);
        return;
      }

    
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      alert('Account deleted successfully.');
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Network error. Check that the API is running and VITE_API_URL points to it.');
    }
  };

  return (
    <div className="delete-section">
      <h2>Delete your account</h2>
      <p>Are you sure you want to delete your account?</p>
      <button onClick={() => deleteAccount(user?.id)} disabled={!user?.id}>
        Delete Account
      </button>
    </div>
  );
}
