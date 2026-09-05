import { CartData } from "@/context/CartContext"
import { server } from "@/main";
import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "@/components/Loading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

function Payment() {
    const {cart, subTotal, fetchCart} = CartData();
    const [address, setAddress] = useState("")
    const [method, setMethod] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const {id} = useParams()

    async function fetchAddress(){
        try {
          const {data} = await axios.get(`${server}/api/address/${id}`,{
            headers:{
              token: Cookies.get("token"),
            }
          });

          setAddress(data);
        } catch(error){
            console.log(error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const paymentHandler = async () => {
        if(method === "cod"){
            setLoading(true)
            try {
             const {data} = await axios.post(`${server}/api/order/new/cod`,{
                method,
                phone: address.phone,
                address: address.address,
             },{
                 headers:{token: Cookies.get("token")}
             });

             setLoading(false)
             toast.success(data.message)
             fetchCart()
             navigate("/order")
            } catch(error) {
                setLoading(false)
                toast.error(error.response.data.message)
            }
        };
        if(method === "online"){
           const stripePromise = loadStripe("pk_test_51UADDVPgHSqQ5ZpgNK3ep9O5otnBCJlT71ZfDf4zllBQgHSJvAtwyGRDeeohmwIrjCSwX3Zt3GGal1lnG5UA78f100rL44Uj3B");
           try {
              setLoading(true)
              // eslint-disable-next-line no-unused-vars
              const stripe = await stripePromise

               const {data} = await axios.post(`${server}/api/order/new/online`,{
                method,
                phone: address.phone,
                address: address.address,
             },{
                 headers:{token: Cookies.get("token")}
             });

             if(data.url){
              window.location.assign(data.url);
               setLoading(false)
             } else{
                toast.error("Failed to create Payment Session")
                setLoading(false)
             }
           } catch(error) {
            toast.error("Payment Failed. please Try again",error.response.data.message)
            setLoading(false)
           }
        }
    };
  return (
    <div>
      {
         loading? <Loading /> : <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center">Proceed to Payment</h2>
              <div>
                <h3 className="text-xl font-semibold">Products</h3>
                <Separator className="my-2" />
                <div className="space-y-4">
                   {
                    cart && cart.map((e,i)=>(
                        <div key={i} className="flex flex-col md:flex-row items-center justify-between bg-card p-4 rounded-lg shadow border dark:border-gray-700">
                            <img src={e.product.images[0].url}  alt="" 
                            className="w-16 h-16 object-contain rounded mb-4 md:mb-0" />
                            <div className="flex-1 md:ml-4 text-center md:text-left">
                               <h2 className="text-lg font-medium">{e.product.title}</h2>
                               <p className="text-sm text-muted-foreground dark:text-gray-400">
                                 EGP {e.product.price} x {e.quantity} 
                               </p> 
                                <p className="text-sm text-muted-foreground dark:text-gray-400">
                                  EGP {e.product.price * e.quantity} 
                               </p> 
                            </div>
                        </div>
                    ))
                   }
                </div>
              </div>
              <div className="text-lg font-medium text-center">
                Total Price to be Paid: EGP {subTotal} 
              </div>
              {
                address && <div className="bg-card p-4 rounded-lg shadow border space-y-4 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-center">Details</h3>
                  <Separator className="my-2" />
                  <div className="flex flex-col space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1"> Delivery Address</h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        <strong>Address:</strong> {address.address}
                      </p>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                        <strong>Phone:</strong> {address.phone}
                      </p>
                    </div>
                    <div className="w-full md:w-1/2 ">
                       <h4 className="font-semibold mb-1">Select Payment Method</h4>
                       <select value={method} onChange={e=>setMethod(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-card dark:bg-gray-900 dark:text-white">
                         <option value="">Select Payment Method</option>   
                         <option value="cod">Cod</option>
                         <option value="online">Online</option>
                       </select>
                    </div>
                  </div>
                </div>
              }
              <Button className="w-full py-3 mt-4" disabled={!method || !address} onClick={paymentHandler}>
                Proceed To Checkout
                </Button>
            </div>
         </div>
      }
    </div>
  )
}

export default Payment
