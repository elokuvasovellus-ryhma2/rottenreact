import { useEffect, useState } from 'react'
import './App.css'

function App() {

  //tilamuuttujat
  //areas lista kaikista finnkinon teattereista
  //shows lista valitun teatterin näytöksistä
  //selectedArea mikä alue on valittuna (id,merkkijono)
  const [areas, setAreas] = useState([])
  const [shows, setShows] = useState([])
  const [selectedArea, setSelectedArea] = useState('')

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
        auditorium: get('TheatreAuditorium')
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

  //muuntaa päivämäärän tunneiksi ja minuuteiksi showtimeihin.
  const fmtTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
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

      <ul>
        {
          shows.length === 0 && selectedArea
            ? <li>Ei näytöksiä valitulla päivällä.</li>
            : shows.map(show => {
                return (
                  <li key={show.id}>
                    {fmtTime(show.start)} — {show.title} ({show.theatre}{show.auditorium ? `, ${show.auditorium}` : ''})
                  </li>
                )
              })
        }
      </ul>
    </div>
  )
}

export default App
