import mongoose from 'mongoose'


const transactionSchema = new mongoose.Schema(

    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            
            ref: 'User',
            required:[true, 'User ID est requis'],
        },
        type:{
            type: String,
            enum: ['income', 'expense'],
            required:[true, 'Le type est requis'],
        },
        category:{
            type: String,
            required: [true,'La categorie est requis'],
            enum:[
                // Revenus
                'Salaire',
                'Freelance',
                'Investissement',
                'Autre revenu',
                // Dépenses
                'Nourriture',
                'Transport',
                'Logement',
                'Loisirs',
                'Shopping',
                'Santé',
                'Éducation',
                'Autre dépense',
            ],
        },
        amount:{
            type: Number,
            required: [true,'Le montant est requis'],
            min:[0,'Le montant doit etre positif'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200,'La description ne peut pas dépasser 200 caracteres'],
        },
        date:{
            type: Date,
            default: Date.now,
            required: true,
        },  
    },
    {
        timestamps: true // add auto createdAt and updatedAt 
    }
);

// Index for optimise the searche  by user
transactionSchema.index({userId:1, date:-1})

// Methode statique for to get the stats for one user
transactionSchema.statics.getStats = async function(userId){
    const transactions = await this.find({userId})
    const totalIncome = transactions
            .filter((t)=>t.type === 'income')
            .reduce((sum,t)=> sum + t.amount,0);
    
    const totalExpense = transactions
            .filter((t)=>t.type === 'expense')
            .reduce((sum, t)=> sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense
    
    // Stats by category (unique expense )
    const expensesByCategory = transactions
            .filter((t)=> t.type === 'expense')
            .reduce((acc,t)=>{
                acc[t.category] = (acc[t.category]|| 0) + t.amount
                return acc
            },{});
    
    return {
        totalIncome,
        totalExpense,
        balance,
        expensesByCategory,
        transactionCount: transactions.length,
    };
};
const Transaction = mongoose.model('Transaction',transactionSchema)

export default Transaction;