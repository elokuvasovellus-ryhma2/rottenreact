import express from 'express'
import cors from 'cors'
import pkg from 'pg'
import dotenv from 'dotenv'

const environment = process.env.NODE_ENV || 'development'

dotenv.config()

const port = process.env.PORT
const {Pool} = pkg

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:false}))



const openDb = () => {
 const pool = new Pool({
 user: process.env.DB_USER,
 host: process.env.DB_HOST,
 database: environment ==="development"?process.env.DB_NAME:
 process.env.DB_NAME,
 password: process.env.DB_PASSWORD,
 port: process.env_DB_PORT 
 })

 return pool
}


export const pool = openDb()

import userRouter from './userRouter.js'
app.use('/users', userRouter)

app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Server error' })
})



app.listen(port, () => {
 console.log(`Server is running on http://localhost:${port}`)
})
