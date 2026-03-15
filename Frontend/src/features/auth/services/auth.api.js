import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export const register = async ({ username, email, password }) => {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });

   

    return response.data;
  } catch (error) {
  
   throw error;
  }
};


export const login = async ({ email, password }) => {


try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });


    console.log(response)

    return response.data;
} catch (error) {
   
throw error;

}
  
  
};

export const logout = async () => {
  try {
    const response = await api.get("/api/auth/logout");

    return response.data;
  } catch (error) {

    throw error;
  }
};

export const profile = async () => {
  try {
    const response = await api.get("/api/auth/profile");
   

    return response.data;
  } catch (error) {
 
    throw  error;
  }
};
