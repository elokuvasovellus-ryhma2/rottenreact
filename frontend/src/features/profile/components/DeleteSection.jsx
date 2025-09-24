
import './DeleteSection.css'; 

export function DeleteSection({ user }) {
  const deleteAccount = (userId) => {
    // TODO: Implement account deletion logic
   
    alert('Tämä toimivaksi');
  };

  return (
    <div className="delete-section">
      <h2>Delete your account</h2>
      <p>Are you sure you want to delete your account?</p>
      <button onClick={() => deleteAccount(user.id)}>Delete Account</button>
    </div>
  );
}
