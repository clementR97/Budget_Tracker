// Composant wrapper : protège les routes (Dashboard, etc.) des utilisateurs non connectés
// useAuth() plutôt que vérifier localStorage directement pour garder l'UI synchronisée
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

const ProtectedRoute = ({children}) =>{
    const {isAuthenticated, loading} = useAuth()
    const location = useLocation()

    // Loader pendant la vérification : évite le flash "redirect" puis "contenu"
    if(loading){
        return(
            <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh">
                <CircularProgress/>
            </Box>
        )
    }
    // Non authentifié : Navigate avec state pour rediriger vers la page après login
    if(!isAuthenticated){
        return <Navigate to="/Sign-in" state={ { from:location } } replace />
    }
    // Authentifié : affiche le contenu protégé (ex: Dashboard)
    return children
}
export default ProtectedRoute