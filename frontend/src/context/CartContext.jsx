import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { server } from "@/main";
import toast from "react-hot-toast";


const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [totalItem, setTotalItem] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [cart, setCart] = useState([]);

  const token = Cookies.get("token");

  const fetchCart = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`${server}/api/cart/all`, {
        headers: {
          token:Cookies.get("token")
        },
      });

      setCart(data.cart);
      setTotalItem(data.sumOfQuantities);
      setSubTotal(data.subTotal);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
      try {
        const {data} = await axios.post(`${server}/api/cart/add`,{product},{
          headers: {
            token,
          }
        });
        toast.success(data.message);
        fetchCart();
      } catch(error) {
        toast.error(error.response.data.message);
      }
  };

  async function updateCart(action, id){
    try {
       // eslint-disable-next-line no-unused-vars
       const {data} = await axios.post(`${server}/api/cart/update?action=${action}`,{id},{
        headers: {
          token,
        }
       });
       fetchCart();
    } catch(error) {
      toast.error(error.response.data.message);
    }
  };

   async function removeFromCart(id){
    try {
       const {data} = await axios.get(`${server}/api/cart/remove/${id}`,{
        headers: {
          token,
        }
       });
       toast.success(data.message)
       fetchCart();
    } catch(error) {
      toast.error(error.response.data.message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  },[]);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItem,
        setTotalItem,
        subTotal,
        loading,
        fetchCart,
        addToCart,
        updateCart,
        removeFromCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const CartData = () => useContext(CartContext);