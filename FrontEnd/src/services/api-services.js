// Service API : centralise les appels fetch vers le backend
// Évite de dupliquer fetch/headers dans chaque composant

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:2000/api'

// Helper : parse la réponse et gère les erreurs (401 = déconnexion auto)
const handleReponse = async(reponse)=>{
    const data = await reponse.json().catch(()=>null)

    if(!reponse.ok){
        // if the token expires or invalid
        if(reponse.status === 401){
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            if(!window.location.pathname.includes('/Sign-in')){
                window.location.href='/Sign-in'
            }
            
        }
        const error = data?.message || 'Une erreur est survenue'
        throw new Error(error)
    }
    return data
}
// Helper : crée les headers avec ou sans token (includeAuth=false pour login/register)
const getHeaders = (includeAuth  = true)=>{
    const headers={
        'Content-Type' : 'application/json',
    }
    if(includeAuth){
        const token = localStorage.getItem('token')
        if(token){
            headers['Authorization'] = `Bearer ${token}`
        }
    }
    return headers
}
// _________________________AUTHENTICATION AUTH_____________________________
export const authAPI = {
    // register : getHeaders(false) car pas encore de token
    register: async(userData) =>{
        const reponse = await fetch(`${API_URL}/auth/register`,{
            method:'POST',
            headers:getHeaders(false),
            body:JSON.stringify(userData),
        })
        const data = await handleReponse(reponse)
        if(data.token){
            localStorage.setItem('token',data.token)
            localStorage.setItem('user',JSON.stringify
                ({
                id: data._id,
                name:data.name,
                email:data.email,
                }))
        }
        return data
    },

    // login : même principe, pas de token avant la réponse
    login: async(credentials)=>{
        const reponse = await fetch (`${API_URL}/auth/login`,{
            method:'POST',
            headers: getHeaders(false),
            body:JSON.stringify(credentials),
        })
        const data = await handleReponse(reponse)
        // save the token and user
        if(data.token){
            localStorage.setItem('token',data.token)
            localStorage.setItem('user',JSON.stringify({
                id: data._id,
                name: data.name,
                email: data.email
            }))
        }
        return data
    },
    // logout : supprime token et user du localStorage (côté client uniquement)
    logout:()=>{
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    },
    // isAuthenticated : vérifie la présence du token (rapide, pas d'appel API)
    isAuthenticated:()=>{
       return !!localStorage.getItem('token')
    },

     // getCurrentUser : lit le user depuis localStorage (évite un appel API /profile)
     getCurrentUser:()=>{
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
     },
     // forgotPassword : envoie l'email au backend pour réinitialisation
     forgotPassword: async(email)=>{
        const reponse = await fetch(`${API_URL}/auth/forgot-password`,{
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({email})

        })
        return handleReponse(reponse)
     },
      
    // resetPassword : token reçu par email, permet de définir le nouveau mot de passe
    resetPassword: async (token,password)=>{
        const reponse = await fetch(`${API_URL}/auth/reset-password/${token}`,{
            method:'POST',
            headers: getHeaders(false),
            body: JSON.stringify({password})
        })
        return handleReponse(reponse)
    },
    // getProfil : récupère les infos à jour depuis l'API (plus fiable que localStorage)
    getProfil: async()=>{
        const reponse = await fetch(`${API_URL}/auth/profile`,{
            method:'GET',
            headers: getHeaders(true)
        })
        return handleReponse(reponse)
    }

}
// ==================== TRANSACTION ====================
export const transactionAPI = {
    // getAll : getHeaders(true) car route protégée, token requis
    getAll: async()=>{
        const reponse = await fetch(`${API_URL}/transactions`,{
            method: 'GET',
            headers: getHeaders(true),
        })
        return handleReponse(reponse)
    },

    // getById : une seule transaction, utile pour l'édition
    getById: async(id)=>{
        const reponse = await fetch(`${API_URL}/transactions/${id}`,{
            method: 'GET',
            headers: getHeaders(true)
        })
        return handleReponse(reponse)
    },
    // create : POST avec body JSON, le backend attache userId via le token
    create: async(data)=>{
        const reponse = await fetch(`${API_URL}/transactions`,{
            method: 'POST',
            headers: getHeaders(true),
            body:JSON.stringify(data),
        })
        return handleReponse(reponse)
    },
    // update : PUT pour mise à jour partielle (PATCH aussi possible)
    update: async(id, data)=>{
        const reponse = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleReponse(reponse);
    },

    // delete : suppression définitive, le backend vérifie userId
    delete: async(id)=>{
        const reponse = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true),
          });
          return handleReponse(reponse);
    },
    // getStats : agrégation côté backend (totalIncome, totalExpense, balance)
    getStats: async () => {
        const reponse = await fetch(`${API_URL}/transactions/stats`, {
          method: 'GET',
          headers: getHeaders(true),
        });
        return handleReponse(reponse);
},
    // filter : passe les filtres en query params (startDate, endDate, category, type)
    filter: async (filters) => {
        const params = new URLSearchParams(filters);
        const reponse = await fetch(`${API_URL}/transactions/filter?${params}`, {
        method: 'GET',
        headers: getHeaders(true),
        });
        return handleReponse(reponse);
    },
};

export default {
    auth: authAPI,
    transactions: transactionAPI,
  };

// ==================== CRUD GÉNÉRIQUE ====================

// export const crudAPI = {
//     // GET tous les éléments
//     getAll: async (resource) => {
//       const response = await fetch(`${API_URL}/${resource}`, {
//         method: 'GET',
//         headers: getHeaders(true),
//       });
//       return handleReponse(response);
//     },
  
//     // GET un élément par ID
//     getById: async (resource, id) => {
//       const response = await fetch(`${API_URL}/${resource}/${id}`, {
//         method: 'GET',
//         headers: getHeaders(true),
//       });
//       return handleReponse(response);
//     },
  
//     // POST créer un nouvel élément
//     create: async (resource, data) => {
//       const response = await fetch(`${API_URL}/${resource}`, {
//         method: 'POST',
//         headers: getHeaders(true),
//         body: JSON.stringify(data),
//       });
//       return handleReponse(response);
//     },
  
//     // PUT mettre à jour un élément
//     update: async (resource, id, data) => {
//       const response = await fetch(`${API_URL}/${resource}/${id}`, {
//         method: 'PUT',
//         headers: getHeaders(true),
//         body: JSON.stringify(data),
//       });
//       return handleReponse(response);
//     },
  
//     // DELETE supprimer un élément
//     delete: async (resource, id) => {
//       const response = await fetch(`${API_URL}/${resource}/${id}`, {
//         method: 'DELETE',
//         headers: getHeaders(true),
//       });
//       return handleReponse(response);
//     },
//   };
  