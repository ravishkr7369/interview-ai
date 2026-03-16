import { useState ,useContext,useEffect} from "react";
import { login,register,logout,profile } from "../services/auth.api.js";

import { AuthContext } from "../auth.context.jsx";


export const useAuth=()=>{
	const context=useContext(AuthContext);
	const {user,setUser,loading,setLoading}=context;

	 const handleLogin = async ({ email, password }) => {
     setLoading(true);
     try {
       const data = await login({ email, password });
       setUser(data?.user);

       return data;
     } catch (err) {
      return err?.response?.data ;
     } finally {
       setLoading(false);
     }
   };

       const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
               return data;
        } catch (err) {
            return err?.response?.data;
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
              return data ;
        } catch (err) {
            return err?.response?.data;
        } finally {
            setLoading(false)
        }
    }


     useEffect(() => {
       const getAndSetUser = async () => {
         try {
           const data = await profile();
           setUser(data.user);

         return data??null;
         } catch (err) {
           return err?.response?.data ;
         } finally {
           setLoading(false);
         }
       };

       getAndSetUser();
     }, []);



	 return {user,loading,handleLogin,handleRegister,handleLogout}

}