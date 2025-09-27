import { useAuth } from '../../shared/contexts/AuthContext';
import { DeleteSection } from './components/DeleteSection';
import { ProfileInfo } from './components/ProfileInfo';
import './Profile.css';
import { AcceptGroupInvites } from './components/AcceptGroupInvites';
import { DeleteGroups } from './components/DeleteGroups';
import { MyGroups } from './components/MyGroups';
import { RemoveFromGroup } from './components/RemoveFromGroup';


export function Profile() {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Profile page</h1>        
        
        <ProfileInfo user={user} />
        <div className="group-upper">
        <AcceptGroupInvites />
        <DeleteGroups />
        </div>
        <div className="group-lower">
        <MyGroups />
        <RemoveFromGroup />
        </div>
        <DeleteSection user={user} />
      </div>
    </div>
  );
}
