import { createContext,useState,useContext,useEffect} from "react";
import { authAPI } from "../services/api-services";

const AuthContext = createContext(null)

// useAuth : hook personnalisé pour accéder au contexte (évite d'importer useContext partout)
export const useAuth=()=>{
    const context = useContext(AuthContext)
    if(!context){
        throw new Error('useAuth doit etre utilisé dans un AuthProvider')
    }
    return context
} 
// AuthProvider : Context API plutôt que props drilling pour partager user/login/logout
export const AuthProvider = ({children})=>{
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)
    const [error,setError]= useState(null)

    // Au montage : restaure user depuis localStorage si token présent (évite déco au refresh)
    useEffect(()=>{
        const initAuth = () =>{
            try{
                const token = localStorage.getItem('token')
                const savedUser = localStorage.getItem('user')
                if(token && savedUser){
                    setUser(JSON.parse(savedUser))
                }
            }catch(err){
                console.error('Erreur initialisation auth:',err)
                authAPI.logout()
                setUser(null)
            }finally{
                setLoading(false)
            }
        }
        initAuth()
    },[])

    // login : appelle authAPI puis met à jour le state user (composants réagissent au changement)
    const login = async (credentials) =>{
        try{
            setError(null)
            setLoading(true)
            //console.log('🔐 AuthContext - Tentative de connexion');

            const data = await authAPI.login(credentials)
            // console.log('✅ AuthContext - Données reçues:', data);

            setUser({
                _id:data._id,
                name: data.name,
                email:data.email,
            })
            // console.log('👤 AuthContext - User set:', user);

            return data 
        }catch(err){
            console.error('❌ AuthContext - Erreur:', err);
            setError(err.message)
            throw err
        }finally{
            setLoading(false)
        }
    }

    // register : même flux que login, authAPI gère le stockage du token
    const register  = async(userData)=>{
        try{
            setError(null)
            setLoading(true)
            const data = await authAPI.register(userData)

            setUser({
                _id: data._id,
                name:data.name,
                email:data.email
            })
            return data
        }catch(err){
            setError(err.message)
            throw err
        }finally{
            setLoading(false)
        }
    }

    // logout : nettoie state + localStorage (authAPI.logout ne touche pas au state React)
    const logout = () =>{
        authAPI.logout()
        setUser(null)
        setError(null)
    }

    // forgotPassword : délègue à authAPI, pas de mise à jour du state user
    const forgotPassword = async(email)=>{
        try{
            setError(null)
            const result = await authAPI.forgotPassword(email)
            return result
        }catch(err){
            setError(err.message)
            throw err
        }
    }
    // resetPassword : token reçu par email, permet de définir le nouveau mot de passe
    const resetPassword = async (token,password) =>{
        try{
            setError(null)
            const result = await authAPI.resetPassword(token,password)
            return result
        }catch(err){
            setError(err)
            throw err
        }
    }
    const value = {
        user,
        loading,
        error,
        // modification la isAuthenticated: !user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        setError,
    }
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}