// Backend/controllers/transactionController.js
import Transaction from "../models/Transaction.js";

/** 
 * @route GET/api/transactions
 * @desc recover all  transactions of user
 * @access Private
*/
export const getTransactions = async(req,res)=>{
    try{
        const transactions = await Transaction.find({userId: req.user._id})
            .sort({date:-1}); //Sort by date decreasing
        
        res.json(transactions)
    }catch(error){
        console.error('Erreur getTransactions:',error)
        res.status(500).json({message: error.message})
    }
};

/**
 * @route   GET /api/transactions/:id
 * @desc    Récupérer une transaction spécifique
 * @access  Private
 */
export const getTransactionById = async (req, res) => {
    try {
      const transaction = await Transaction.findOne({
        _id: req.params.id,
        userId: req.user._id, // Sécurité : vérifier que c'est bien la transaction de l'user
      });
  
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction non trouvée' });
      }
  
      res.json(transaction);
    } catch (error) {
      console.error('Erreur getTransactionById:', error);
      res.status(500).json({ message: error.message });
    }
  };

/**
 * @route POST /api/transactions
 * @desc create a new transaction
 * @access Private
 */
export const createTransaction = async (req,res)=>{
    try{
        const{type,category,amount,description,date} = req.body

        // validate
        if(!type || !category ||!amount){
            return res.status(400).json({
                message:'Le type, la categorie et le montant est requis',
            });
        }
        if(amount <= 0){
            return res.status(400).json({
                message:'le montant doit etre supérieur à 0',
            });
        }
        // create the transaction
        const transaction = new Transaction({
            userId: req.body._id,
            type,
            category,
            amount,
            description,
            date: date || Date.now(),
        })
        await transaction.save()
        res.status(201).json(transaction)
    }catch(error){
        console.error('Erreur createTransaction:',error)
        res.status(400).json({message: error.message})
    }
};
/**
 * @route   PUT /api/transactions/:id
 * @desc    Mettre à jour une transaction
 * @access  Private
 */
export const updateTransaction = async(req,res)=>{
    try{
        const {type,category,amount,description,date} = req.body

        // validate
        if(amount!==undefined && amount <= 0){
            return res.status(400).json({
                message: 'Le montant doit etre supérieur a 0'
            })
        }
        // search and update
        const transaction = await Transaction.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id //secure
            },
            {
                type,
                category,
                amount,
                description,
                date,
            },
            {
                new: true, // return the doc update
                runValidators: true, // valide the data
            }
        );
        if(!transaction){
            return res.status(404).json({message:'Transaction non trouvée'})
        }
        res.json(transaction)

    }catch(error){
        console.error('Erreur updateTransaction:',error)
        res.status(400).json({message:error.message })
    }
};

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Supprimer une transaction
 * @access  Private
 */
export const deleteTransaction = async(req,res)=>{
    try{
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.params._id //secure
        })
        if(!transaction){
            return res.status(404).json({message:'Transaction non trouvée' })
        }
        res.json({message: 'Transaction supprimée avec succes'})
    }catch(error){
        console.error('Erreur deleteTransaction:',error)
        res.status(500).json({message: error.message})
    }
};

/**
 * @route   GET /api/transactions/stats
 * @desc    Récupérer les statistiques de l'utilisateur
 * @access  Private
 */
export const getStats = async (req, res) => {
    try {
      const stats = await Transaction.getStats(req.user._id);
      res.json(stats);
    } catch (error) {
      console.error('Erreur getStats:', error);
      res.status(500).json({ message: error.message });
    }
  };

/**
 * @route   GET /api/transactions/filter
 * @desc    Filtrer les transactions (par date, catégorie, type)
 * @access  Private
 */

export const filterTransactions = async(req,res)=>{
    try{
        const{startDate, endDate, category, type} = req.query

        // build the filter
        const filter = {userId: req.user._id}

        if(startDate || endDate){
            filter.date = {}
            if(startDate) filter.date.$gte = new Date(startDate)
            if(endDate) filter.date.$lte = new Date(endDate)    
        }
    if(category) filter.category = category
    if(type) filter.date.type = type

    const transactions = await Transaction.find(filter).sort({date: -1})

    res.json(transactions)

    }catch(error){
        console.error('Erreur filterTransactions:',error)
        res.status(500).json({message: error.message})
    }
};

export default{
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getStats,
    filterTransactions
}