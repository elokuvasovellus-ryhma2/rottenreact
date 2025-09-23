
import { useState } from 'react'
import { UserContext } from './UserContext'
import axios from 'axios'


export default function UserProvider({ children }) {
  const userFromStorage = sessionStorage.getItem('user')
  const [user, setUser] = useState(
    userFromStorage ? JSON.parse(userFromStorage) : null
  )

  
  const signUp = async (email, password) => {
    const headers = { headers: { 'Content-Type': 'application/json' } }
    await axios.post(
      `${import.meta.env.VITE_API_URL}/users/signup`,
      JSON.stringify({ user: { email, password } }),
      headers
    )
   
    setUser(null)
  }


  const signIn = async (email, password) => {
    const headers = { headers: { 'Content-Type': 'application/json' } }
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/users/signin`,
      JSON.stringify({ user: { email, password } }),
      headers
    )

    setUser(response.data)
    sessionStorage.setItem('user', JSON.stringify(response.data))
  }

 
  const signOut = () => {
    sessionStorage.removeItem('user')
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, setUser, signUp, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  )
}