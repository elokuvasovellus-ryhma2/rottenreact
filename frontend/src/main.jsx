import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './shared/components/Navbar.css'
import './shared/components/Footer.css'
import App from './App.jsx'
import Authentication, { AuthenticationMode } from './shared/components/Authentication'
import ProtectedRoute from './shared/components/ProtectedRoute.jsx'
import UserProvider from './shared/contexts/UserProvider.jsx'
import { RouterProvider } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import NotFound from './shared/components/NotFound.jsx'


const router = createBrowserRouter([
{
 errorElement: <NotFound />
 },
 {
 path: "/signin",
 element: <Authentication authenticationMode={AuthenticationMode.SignIn} />
 },
 {
 path: "/signup",
 element: <Authentication authenticationMode={AuthenticationMode.SignUp} />
 },
 {
 element: <ProtectedRoute />,
 children: [
 {
 path: "/",
 element: <App />,
 }
 ]
 }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
 <RouterProvider router={router} />
 </UserProvider>
    <App />
  </StrictMode>,
)
