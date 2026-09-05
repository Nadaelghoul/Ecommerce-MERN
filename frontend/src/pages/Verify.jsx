import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CartData } from "@/context/CartContext";
import { UserData } from "@/context/UserContext";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Verify() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate()
  const {loginUser ,btnLoading, verifyUser} = UserData()
  const [timer, setTimer] = useState(90) //Start the timer at 90 seconds.
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if(timer > 0 ){
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        },1000); //every second timer=timer-1 until reaches 0

        return () => clearInterval(interval);
    }else{
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCanResend(true)  
    }
  },[timer]);

  const formatTime = (time) => { //This converts a number of seconds into: MM:SS
     const minutes= Math.floor(time/60)
     const seconds = time % 60
     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  const handleResendOtp = async() => {
    const email = localStorage.getItem("email")
    await loginUser(email, navigate)
    setTimer(90);
    setCanResend(false);
  };

  const {fetchCart} = CartData()

  const submitHandler = () => {
    verifyUser(Number(otp), navigate, fetchCart);
  };

  return (
    <div className="min-h-[60vh]">
      <Card className="md:w-100 sm:w-75 m-auto mt-8">
        <CardHeader>
          <CardTitle>Verify User Otp</CardTitle>
          <CardDescription>
            if you didn`t get otp in your mail inbox then you can check your otp in your mail spam section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-x-1">
            <Label className="mb-2">Enter Otp</Label>
            <Input type="number"
             value={otp}
             onChange={(e) => setOtp(e.target.value)} 
           />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={btnLoading} onClick={submitHandler}>
           {btnLoading? <Loader /> : "Submit"}
          </Button>
        </CardFooter>
        <div className="flex flex-col justify-center items-center w-50 m-auto">
           <p className="text-lg mb-3">
            {
              canResend?"You can now Resend OTP": `Time remaining: ${formatTime(timer)}`
            }
           </p>
           <Button onClick={handleResendOtp} className="mb-3" disabled={!canResend}>Resend Otp</Button>
        </div>
      </Card>
    </div>
  )
}

export default Verify;
