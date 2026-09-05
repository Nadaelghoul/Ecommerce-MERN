import { server } from "@/main";
import axios from "axios";
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function Checkout() {
    const [address, setAddress] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [newAddress, setNewAddress] = useState({
        address: "",
        phone: "",
    });

    async function fetchAddress(){
        try {
          const {data} = await axios.get(`${server}/api/address/all`,{
            headers:{
                token: Cookies.get("token"),
            },
          });
          setAddress(data);
           setLoading(false);
        } catch(error) {
            console.log(error);
            setLoading(false);
        }
    }

    const handleAddAddress = async() => {
        try {
         const {data} = await axios.post(`${server}/api/address/new`,{address:
            newAddress.address, phone: newAddress.phone},{
                headers: {
                    token: Cookies.get("token")
                }
            });
            if(data.message){
                toast.success(data.message)
                fetchAddress()
                setNewAddress({
                    address:"",
                    phone:""
                }),
                setModalOpen(false);
            };
        } catch(error) {
          toast.error(error.response.data.message)
        }
    };

    useEffect(()=>{
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAddress()
    },[])

    const deleteHandler = async(id) =>{
       if(confirm("Are you sure you want to delete this address")){
          try{
          const {data} = await axios.delete(`${server}/api/address/${id}`,{
            headers: {
                token: Cookies.get("token"),
            }
          });
          toast.success(data.message);
          fetchAddress();
        } catch(error){
           toast.error(error.response.data.message)
        }
       }
    };
  return (
    <div className="container mx-auto px-4 py-8 min-h-[60vh]">
     <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
     {
        loading ? <Loading /> : <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
           {address && address.length>0 ? address.map((e)=>(
             <div className="p-3 sm:p-4 border rounded-lg shadow-sm w-full" key={e._id}>
               <div className="flex items-start justify-between gap-2">
                 <h3 className="text-sm sm:text-base md:text-lg font-semibold min-w-0 wrap-break-word">
                  Address - {e.address}
                 </h3>
             <Button  variant="destructive" size="icon" onClick={()=>deleteHandler(e._id)}
              className="shrink-0 h-8 w-8 sm:h-9 sm:w-9" >
               <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
             </Button>
            </div>

          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
             Phone - {e.phone}
           </p>

         <Link to={`/payment/${e._id}`} className="block mt-3">
         <Button variant="outline" size="sm" className="w-full sm:w-auto">
           Use Address
        </Button>
         </Link>
        </div>
           )) : <p>No Address found</p> }
        </div>
     }
     <Button className="mt-6" variant="outline" onClick={()=>setModalOpen(true)}>Add New Address</Button> 
     <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Address" value={newAddress.address}
             onChange={e=>setNewAddress({...newAddress, address:e.target.value})} />
            <Input type="number" placeholder="Phone" value={newAddress.phone}
             onChange={e=>setNewAddress({...newAddress, phone:e.target.value})} />
          </div>
         <DialogFooter>
          <Button variant="outline" onClick={()=>setModalOpen(false)}>
           Close
         </Button>  
          <Button variant="outline" onClick={handleAddAddress}>
            Add Address
         </Button>  
        </DialogFooter>
        </DialogContent>
     </Dialog>
    </div>
  )
}

export default Checkout
