import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import authRouter from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
dotenv.config()


const app = express()

// express.json() : parse le body JSON des requêtes POST/PUT
// urlencoded : parse les formulaires HTML (form-data)
app.use(express.json())
app.use(express.urlencoded({extended: true}))
// CORS : autorise l'app frontend (port 5173) à appeler l'API
// credentials:true pour envoyer les cookies/token
app.use(cors({
  origin:process.env.CLIENT_URL || '*',
  credentials:true,
  methods:['GET','POST','PUT','DELETE','PATCH'],
  allowedHeaders:['Content-Type','Authorization'],
}))


app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Budget Tracker API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions' }
    })
})

app.use('/api/auth', (req, res, next) => {
  console.log('🔍 Requête auth reçue:', req.method, req.path)
  next()
})

// Road of authentification
app.use('/api/auth',authRouter)
console.log('✅ authRouter type:', typeof authRouter)
//console.log('✅ authRouter:', authRouter)

// Road of transaction
app.use('/api/transactions',transactionRoutes)
console.log('✅ transactionRoutes type:', typeof transactionRoutes)

// Middleware 404 : route non trouvée (doit être après les routes définies)
app.use((req,res)=>{
    res.status(404).json({
      message: 'Route non trouvée',
      path: req.originalUrl
    })
})

// Middleware d'erreur : capture les erreurs non gérées
// En dev on expose err.message, en prod on masque les détails
app.use((err,req,res,next)=>{
  console.error('Erreur serveur:',err)
    res.status(500).json({
      message:'Erreur serveur',
      error:process.env.NODE_ENV==='development'? err.message:undefined
    })
 })

// Démarrage du serveur : PORT depuis .env ou 2000 par défaut
const PORT = process.env.PORT || 2000
connectDB()
    .then(()=>{
      app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${PORT}`);
      console.log(`📍 API disponible sur http://localhost:${PORT}`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`💰 Transactions: http://localhost:${PORT}/api/transactions`);
    })
    })
    .catch((err)=>{
      console.error('❌ Impossible de démarrer le serveur:', err)
      process.exit(1)
    })
