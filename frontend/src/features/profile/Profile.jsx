import { useAuth } from '../../shared/contexts/AuthContext';
import { DeleteSection } from './components/DeleteSection';
import { ProfileInfo } from './components/ProfileInfo';
import './Profile.css';


export function Profile() {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Profile page</h1>        
        <ProfileInfo user={user} />
        <DeleteSection user={user} />
      </div>
    </div>
  );
}
