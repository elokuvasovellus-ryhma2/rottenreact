import { useEffect, useState } from 'react'
import"./showtimes.css";


export function Showtimes() {
  const API = import.meta.env.VITE_API_URL;
  const userId = (() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "null")?.id ?? null; }
    catch { return null; }
  })();

  //tilamuuttujat
  //areas lista kaikista finnkinon teattereista
  //shows lista valitun teatterin näytöksistä
  //selectedArea mikä alue on valittuna (id,merkkijono)
  //nameInput mikä elokuva haetaan (merkkijono)
  const [areas, setAreas] = useState([])
  const [shows, setShows] = useState([])
  const [selectedArea, setSelectedArea] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedShow, setSelectedShow] = useState(null)
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [invitationText, setInvitationText] = useState('')

  //pad varmistaa että kuukausi ja päivä on kahden numeron mittaisia
  //todayInput muodostaa päivämäärän yyyy-mm-dd.
  const pad = (n) => String(n).padStart(2, '0')
  const now = new Date()
  const todayInput = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const [dateInput, setDateInput] = useState(todayInput)

  //muunnetaan päivämäärä finnkinon rajapintaan sopivaksi (dd.mm.yyyy)
  const toFinnDate = (yyyyMmDd) => {
    const [y, m, d] = yyyyMmDd.split('-')
    return `${d}.${m}.${y}` 
  }

  //DOMparser muuttaa raakatekstin (xml) selaimen XML-DOM-rakenteeksi
  //root[0] on XML-juurielementti finnkinon vastauksessa <theatreAreas> ja sen childreneitä ovat yksittäisiä <TheatreArea>-elementtejä
  //jokaisessa teatterialueessa odotetaan alielementit kuten ID ja name
  //poimitaan id ja name ja rakennetaan javascript olio.
  //setArea tallettaa listan tilaan.
  const getFinnkinoTheatres = (xml) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'application/xml')
    const root = xmlDoc.children
    const theatres = root[0].children
    const tempAreas = []
    for (let i = 0; i < theatres.length; i++) {
      tempAreas.push({
        "id": theatres[i].children[0].innerHTML,
        "name": theatres[i].children[1].innerHTML
      })
    }
    setAreas(tempAreas)
  }

  const getFinnkinoShowtimes = (xml) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'application/xml')
    const showNodes = xmlDoc.getElementsByTagName('Show')
    const tempShows = []
    for (let i = 0; i < showNodes.length; i++) {
      const s = showNodes[i]
      const get = (tag) => s.getElementsByTagName(tag)[0]?.textContent || ''
      tempShows.push({
        id: get('ID'),
        title: get('Title'),
        start: get('dttmShowStart'),
        theatre: get('Theatre'),
        auditorium: get('TheatreAuditorium'),
        images: get('EventSmallImagePortrait'),
      })
    }
    setShows(tempShows)
  }

  //Haetaan aikataulu finnkinosta ja parsitaan se getFinnkinoShowtimes funktiolla
  const fetchSchedule = (areaId, yyyyMmDd) => {
    if (!areaId) { setShows([]); return }
    const dt = toFinnDate(yyyyMmDd)
    fetch(`https://www.finnkino.fi/xml/Schedule/?area=${areaId}&dt=${dt}`)
      .then(response => response.text())
      .then(xml => {
        getFinnkinoShowtimes(xml)
      })
      .catch(error => {
        console.log(error)
        setShows([])
      })
  }


  useEffect(() => {
    fetch('https://www.finnkino.fi/xml/TheatreAreas')
      .then(response => response.text())
      .then(xml => {
        getFinnkinoTheatres(xml)
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

  // Hae käyttäjän ryhmät
  useEffect(() => {
    if (!userId) return;
    fetchUserGroups();
  }, [userId]);

  //käsittelee paikkakunnanvalinnan ja päivittää tilan
  const handleAreaChange = (e) => {
    const areaId = e.target.value
    setSelectedArea(areaId)
    fetchSchedule(areaId, dateInput)
  }

  //käsittelee päivämäärän valinnan ja päivittää tilan
  const handleDateChange = (e) => {
    const newDate = e.target.value
    setDateInput(newDate)
    if (selectedArea) {
      fetchSchedule(selectedArea, newDate)
    }
  }

  //käsittelee elokuvan nimen valinnan ja päivittää tilan
  const handleNameChange = (e) => {
    const newName = e.target.value
    setNameInput(newName)
  }

  //muuntaa päivämäärän tunneiksi ja minuuteiksi showtimeihin.
  const fmtTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })
  }

  //käsittelee popup-ikkunan avaamisen ja sulkemisen
  const handleOpenPopup = (show) => {
    setSelectedShow(show)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedShow(null)
    setSelectedGroup('')
    setInvitationText('')
  }

  // Hae käyttäjän kaikki ryhmät
  const fetchUserGroups = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/Group/user-every-group/${userId}`);
      const data = await res.json();
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  // Käsittelee ryhmän valinnan
  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  // Käsittelee kutsuviestin muutoksen
  const handleInvitationChange = (e) => {
    setInvitationText(e.target.value);
  };

  // Lähetä kutsu (placeholder funktio)
  const handleSendInvitation = () => {
    if (!selectedGroup || !selectedShow) {
      alert('Valitse ryhmä ja elokuva!');
      return;
    }
    
    alert('Sending invitation:' +
      'groupId: ' + selectedGroup +
      'Leffan nimi: ' + selectedShow.title +
      'Teatteri: ' + selectedShow.theatre +
      'Sali: ' + selectedShow.auditorium +
      'Näytösaika: ' + selectedShow.start +
      'Päivä: ' + dateInput +
      'Alue: ' + selectedArea +
      'Kutsuviesti: ' + invitationText
    );
    
    // TODO: Implement actual API call to send invitation
    alert('Kutsu lähetetty!');
    handleClosePopup();
  };

  return (
    <div className="showtimes">
      <select onChange={handleAreaChange} defaultValue="">
        <option value="" disabled>Valitse paikkakunta…</option>
        {
          areas.map(area => {
            return <option key={area.id} value={area.id}>{area.name}</option>
          })
        }
      </select>

      <input
        type="date"
        value={dateInput}
        onChange={handleDateChange}
      />

      <input
        type="text"
        placeholder="Hae elokuvan nimellä..."
        value={nameInput}
        onChange={handleNameChange}
      />


      <ul>
        {
          shows.length === 0 && selectedArea
            ? <li>Ei näytöksiä valitulla päivällä.</li>
            : shows
                .filter(show => 
                  nameInput === '' || 
                  show.title.toLowerCase().includes(nameInput.toLowerCase())
                )
                .map(show => {
                return (
                  <li key={show.id}>
                    <img
                    className="images"
                    src={show.images}
                    />
                    <span>
                      {fmtTime(show.start)} — {show.title} ({show.theatre}{show.auditorium ? `, ${show.auditorium}` : ''})
                    </span>
                    <button 
                      onClick={() => handleOpenPopup(show)} 
                      className="movie-popup-button"
                    >
                      Näytä tiedot
                    </button>
                  </li>
                )
              })
        }
      </ul>

      {/* Popup window */}
      {isPopupOpen && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Pyydä seuraa näytökseen</h2>
              <button className="close-button" onClick={handleClosePopup}>
                ×
              </button>
            </div>
            <div className="popup-body">
              {selectedShow && (
                <>
                  <div className="movie-popup-image">
                    <img src={selectedShow.images} alt={selectedShow.title} />
                  </div>
                  <h3>{selectedShow.title}</h3>
                  <p>Näytösaika: {fmtTime(selectedShow.start)}</p>
                  <p>Teatteri: {selectedShow.theatre}</p>
                  {selectedShow.auditorium && (
                    <p>Sali: {selectedShow.auditorium}</p>
                  )}
                  <p>Päivä: {dateInput}</p>
                  <p>Alue: {selectedArea ? areas.find(area => area.id === selectedArea)?.name : 'Ei valittu'}</p>
                </>
              )}
              <div className="popup-text">
                <h3>Valitse ryhmä ja kirjoita kutsuviesti</h3>
                
                <div className="group-selection">
                  <label htmlFor="group-select">Valitse ryhmä:</label>
                  <select 
                    id="group-select"
                    value={selectedGroup} 
                    onChange={handleGroupChange}
                    className="group-dropdown"
                  >
                    <option value="">Valitse ryhmä...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="invitation-text">
                  <label htmlFor="invitation-input">Kutsuviesti:</label>
                  <input 
                    id="invitation-input"
                    type="text" 
                    placeholder="Kirjoita tähän vapaavalintainen kutsu näytökseen..." 
                    value={invitationText}
                    onChange={handleInvitationChange}
                  />
                </div>

                <button className="popup-button" onClick={handleSendInvitation}>
                  Lähetä kutsu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
