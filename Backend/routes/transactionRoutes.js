import express from 'express'
import {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getStats,
    filterTransactions,
} from '../controllers/transactionController.js'
import {protect} from '../middleware/authMiddleware.js'
import { get } from 'mongoose'

const router = express.Router()

// all roads necessary for authentification
router.use(protect)
// Roads
router.get('/stats',getStats)
router.get('/filter',filterTransactions)
router.get('/',getTransactions)
router.get('/:id',getTransactionById)
router.post('/',createTransaction)
router.put('/:id',updateTransaction)
router.delete('/:id',deleteTransaction)

export default router

// ==================== DOCUMENTATION of ROAD ====================
/*

GET /api/transactions
- Recover all  transactions of user
- Headers: Authorization: Bearer TOKEN
- Answere: Array de transactions

GET /api/transactions/stats
- Recover the stats (revenus, dépenses, solde)
- Headers: Authorization: Bearer TOKEN
- Answere: { totalIncome, totalExpense, balance, expensesByCategory, transactionCount }

GET /api/transactions/filter?startDate=...&endDate=...&category=...&type=...
- Filter the transactions
- Query params (optionnels): startDate, endDate, category, type
- Headers: Authorization: Bearer TOKEN
- Answere: Array filter of transactions 

GET /api/transactions/:id
- Recover a transaction specific
- Headers: Authorization: Bearer TOKEN
- Answere: Transaction object

POST /api/transactions
- Create a new transaction
- Headers: Authorization: Bearer TOKEN
- Body: { type, category, amount, description?, date? }
- Answere: Transaction create

PUT /api/transactions/:id
- update of the transaction
- Headers: Authorization: Bearer TOKEN
- Body: { type?, category?, amount?, description?, date? }
- Answere: Transaction update

DELETE /api/transactions/:id
- delete one transaction
- Headers: Authorization: Bearer TOKEN
- Answere: { message: "Transaction delete with success" }

*/