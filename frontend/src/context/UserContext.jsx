import { server } from "@/main";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast, {Toaster} from 'react-hot-toast';
import Cookies from "js-cookie";

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);
    const [isAuth, setIsAuth] = useState(false);

    async function loginUser (email, navigate){
        setBtnLoading(true)
        try {
          const {data} = await axios.post(`${server}/api/user/login`, {
            email });

            toast.success(data.message);
            localStorage.setItem("email", email);
            navigate("/verify");
            setBtnLoading(false);

        } catch(error) {
           toast.error(error.response?.data?.message)
           setBtnLoading(false)
        }
    }

    async function verifyUser (otp, navigate, fetchCart){
        setBtnLoading(true);
        const email = localStorage.getItem('email')
        try {
          const {data} = await axios.post(`${server}/api/user/verify`, {
            email, otp });

           toast.success(data.message);
           Cookies.set("token", data.token, {
           expires: 15,
           secure: false,
           path: "/",
           });

       setIsAuth(true);
       setUser(data.user);
       localStorage.removeItem("email"); //localstorage.clear()
       setBtnLoading(false);
       navigate("/", { replace: true });
       fetchCart();

        } catch(error) {
           toast.error(error.response?.data?.message)
           setBtnLoading(false)
        }
    }

  function logoutUser(navigate,  setTotalItem){
  Cookies.remove("token", { path: "/" });
  setUser([]);
  setIsAuth(false);
  navigate("/login");
  toast.success("Logged Out");
   setTotalItem(0);
  }

  useEffect(() => {
    const fetchUser = async () => {
    const token = Cookies.get("token");

    if (!token) {
      setIsAuth(false);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${server}/api/user/me`, {
        headers: {
          token,
          "Cache-Control": "no-cache",
        }
      });

      setUser(data.user);
      setIsAuth(true);

    } catch (error) {
      console.log(error);
       setIsAuth(false)

    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);

    return (
     <UserContext.Provider value={{ user, loading, btnLoading, isAuth,loginUser, verifyUser, logoutUser }}>
        {children}
        <Toaster />
    </UserContext.Provider>
    );
};

export const UserData = () => useContext(UserContext);