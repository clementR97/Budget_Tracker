// Components/Dashboard.jsx
// Dashboard simple pour tester l'authentification

import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Logout,
  TrendingUp,
  TrendingDown,
  AccountBalance,
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api-services.js';


const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // États
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // Formulaire
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const categories = {
    income: ['Salaire', 'Freelance', 'Investissement'],
    expense: ['Nourriture', 'Transport', 'Logement', 'Loisirs', 'Shopping', 'Santé', 'Autre'],
  };

  // Charger les données au montage
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsData, statsData] = await Promise.all([
        transactionAPI.getAll(),
        transactionAPI.getStats(),
      ]);
      setTransactions(transactionsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset category si on change de type
      ...(name === 'type' && { category: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🎨 FRONTEND - Début handleSubmit');
    console.log('📝 FRONTEND - formData:', formData);
    console.log('✏️ FRONTEND - editingTransaction:', editingTransaction);


    try {
      if (editingTransaction) {

        console.log('🔄 FRONTEND - Mode édition');

        await transactionAPI.update(editingTransaction._id, formData);
      } else {

        console.log('➕ FRONTEND - Mode création');
        console.log('📤 FRONTEND - Appel API create avec:', formData);

        const result = await transactionAPI.create(formData);
        console.log('✅ FRONTEND - Résultat:', result);
      }
      
      await fetchData();
      handleCloseDialog();
    } catch (err) {
      console.error('❌ FRONTEND - Erreur:', err);
      console.error('❌ FRONTEND - Message:', err.message);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette transaction ?')) return;
    
    try {
      await transactionAPI.delete(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/Sign-in');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <>
      {/* Barre de navigation */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            💰 Budget Tracker
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#4caf50', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <div>
                    <Typography variant="body2">Revenus</Typography>
                    <Typography variant="h4">
                      {stats ? formatAmount(stats.totalIncome) : '0 €'}
                    </Typography>
                  </div>
                  <TrendingUp sx={{ fontSize: 48, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#f44336', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <div>
                    <Typography variant="body2">Dépenses</Typography>
                    <Typography variant="h4">
                      {stats ? formatAmount(stats.totalExpense) : '0 €'}
                    </Typography>
                  </div>
                  <TrendingDown sx={{ fontSize: 48, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: stats?.balance >= 0 ? '#2196f3' : '#ff9800', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <div>
                    <Typography variant="body2">Solde</Typography>
                    <Typography variant="h4">
                      {stats ? formatAmount(stats.balance) : '0 €'}
                    </Typography>
                  </div>
                  <AccountBalance sx={{ fontSize: 48, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* En-tête liste */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Transactions</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nouvelle transaction
          </Button>
        </Box>

        {/* Liste des transactions */}
        {transactions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Aucune transaction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajoutez votre première transaction pour commencer
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Montant</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                        color={transaction.type === 'income' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                    <TableCell align="right">
                      <Typography
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatAmount(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(transaction)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(transaction._id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Dialog Ajouter/Modifier */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingTransaction ? 'Modifier' : 'Nouvelle'} transaction
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                  required
                >
                  <MenuItem value="income">Revenu</MenuItem>
                  <MenuItem value="expense">Dépense</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Catégorie"
                  required
                >
                  {categories[formData.type].map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Montant"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                fullWidth
                label="Description (optionnel)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
              />

              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained">
              {editingTransaction ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default Dashboard;