import { useMemo } from "react";
import{
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    plugins,
    scales,
  } from 'chart.js';
  import { Pie, Bar, Line } from 'react-chartjs-2';
  import { Grid, Paper, Typography, Box } from '@mui/material';

//   save the componants Chart.js

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
)

const Charts = ({transactions, stats})=>{

    console.log('📊 Charts - transactions:', transactions);
  console.log('📊 Charts - stats:', stats);
  console.log('📊 Charts - expensesByCategory:', stats?.expensesByCategory);
  
    // ==================== GRAPHIQUE 1 : DÉPENSES PAR CATÉGORIE (PIE) ====================
    const expensesByCategoryData = useMemo(()=>{
        console.log('🥧 Calcul du camembert...');
        if(!stats?.expensesByCategory){
            console.log('❌ Pas de expensesByCategory dans stats');
         return null
        }

        const categories = Object.keys(stats.expensesByCategory)
        const amounts = Object.values(stats.expensesByCategory)

        console.log('📊 Catégories:', categories);
    console.log('💰 Montants:', amounts);

    if (categories.length === 0) {
        console.log('⚠️ Aucune catégorie de dépenses');
        return null;
      }
        // color for differnce categories
        const colors = [
            '#FF6384', // Rose
            '#36A2EB', // Bleu
            '#FFCE56', // Jaune
            '#4BC0C0', // Turquoise
            '#9966FF', // Violet
            '#FF9F40', // Orange
            '#FF6384', // Rose clair
            '#C9CBCF', // Gris
        ];

        const chartData = {
            labels: categories,
            datasets: [{
              label: 'Dépenses (€)',
              data: amounts,
              backgroundColor: colors.slice(0, categories.length),
              borderColor: '#fff',
              borderWidth: 2,
            }],
          };
          
          console.log('✅ Données du camembert:', chartData);

        return chartData
    },[stats]);

     // ==================== GRAPHIQUE 2 : REVENUS VS DÉPENSES (BAR) ====================

     const incomeVsExpenseData = useMemo(()=>{
        return {
            labels:['Revenus', 'Depenses'],
            datasets:[
                {
                    label: 'Montant (€)',
                    data: [stats.totalIncome || 0, stats?.totalExpense || 0],
                    backgroundColor: ['#4caf50', '#f44336'],
                    borderColor:['#388e3c', '#d32f2f'],
                    borderWidth: 2,

                },
            ],
        };
     },[stats])

     // ==================== GRAPHIQUE 3 : ÉVOLUTION DU SOLDE (LINE) ====================
     const balanceOverTimeData = useMemo(()=>{
        if (!transactions || transactions.length === 0) return null;
        // Sort transactions with no date
        const sortedTransactions = [...transactions].sort(
            (a,b) => new Date(a.date) - new Date(b.date)
        )

        // Calculate the cumulative balance
        let cumulativeBalance = 0
        const balances = sortedTransactions.map((transaction)=>{
            if(transaction.type === 'income'){
                cumulativeBalance += transaction.amount
            }else{
                cumulativeBalance -= transaction.amount
            }
            return cumulativeBalance
        });
        // Formating the date
        const labels = sortedTransactions.map((transaction)=>{
            const date = new Date(transaction.date)
            return date.toLocaleDateString('fr-FR',{day: '2-digit',month:'short' })
        })
        return{
            labels,
            datasets:[
                {
                    label: 'Solde(€)',
                    data: balances,
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    fill: true,
                    tension: 0.4, //Courbe lisse
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#2196f3',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                },
            ],
        };
     },[transactions])
    //  option for graphs
    const pieOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins:{
            legend:{
                position: 'bottom',
            },
            tooltip:{
                callbacks:{
                    label:function(context){
                        const label = context.label || ''
                        const value = context.parsed || 0
                        const total = context.dataset.data.reduce((a,b) => a + b, 0)
                        const percentage = ((value / total) * 100).toFixed(1)
                        return `${label}: ${value.toFixed(2)}€ (${percentage} %)`;
                    },
                },
            },
        },
    };
    const barOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins:{
            legend:{
                display: false,
            },
            tooltip:{
                callbacks:{
                    label: function (context){
                        return `${context.parsed.y.toFixed(2)} €`;
                    },
                },
            },
        },
        scales:{
            y:{
                beginAtZero: true,
                ticks:{
                    callback: function(value){
                        return value + '€';
                    },
                },
            },
        },

    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins:{
            legend:{
                display: true,
                position: 'top',
            },
            tooltip:{
                callbacks:{
                    label: function(context){
                        return `Solde: ${context.parsed.y.toFixed(2)} €`;
                    },
                },
            },
        },
        scales:{
            y:{
                ticks:{
                    callback: function (value){
                        return value + '€';
                    },
                },
            },
        },

    };

    // if we don't have data 
    if(!transactions || transactions.length === 0){
        return(
            <Box sx={{ textAlign: 'center', py: 4}}>
                <Typography variant="h6" color="text.secondary">
                📊 Ajoutez des transactions pour voir les graphiques
                </Typography>
            </Box>
        );
    }
    return(
        <Grid container spacing={3}>
            {/* {Graphique 1 : Dépenses par caégorie} */}
            {/* {expensesByCategoryData && Object.keys(stats.expensesByCategory).length > 0 && (
                <Grid item xs={12} md={6}>
                    <Paper sx={{p:3}}>
                        <Typography variant="h6" gutterBottom>
                        📊 Dépenses par categorie
                        </Typography>
                        <Box sx={{height: 500, display:'flex', justifyContent:'center', alignItems: 'center'}}>
                            <Pie data={expensesByCategoryData} options={pieOptions}/>
                        </Box>
                    </Paper>
                </Grid>
            )} */}

<Grid item xs={12} md={6}>
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>
      📊 Dépenses par catégorie
    </Typography>
    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {expensesByCategoryData && Object.keys(stats?.expensesByCategory || {}).length > 0 ? (
        <Pie data={expensesByCategoryData} options={pieOptions} />
      ) : (
        <Typography variant="body2" color="text.secondary">
          Ajoutez des dépenses pour voir ce graphique
        </Typography>
      )}
    </Box>
  </Paper>
</Grid>    

            {/* Graphique 2 : Revenus vs Dépenses */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{p:3}}>
                        <Typography variant="h6" gutterBottom>
                        📊 Revenus vs Depenses
                        </Typography>
                        <Box sx={{height:400}}>
                            <Bar data={incomeVsExpenseData} options={barOptions}/>
                        </Box>
                    </Paper>
                </Grid>
            {/* Graphique 3 : Évolution du solde */}
            {balanceOverTimeData && (
                <Grid item xs={12}>
                    <Paper sx={{p:3}}>
                        <Typography variant="h6" gutterBottom>
                        📈 Évolution du solde
                        </Typography>
                        <Box sx={{height: 400}}>
                            <Line data={balanceOverTimeData} options={lineOptions}/>
                        </Box>
                    </Paper>
                </Grid>
            )}
        </Grid>
    );
};
export default Charts;
