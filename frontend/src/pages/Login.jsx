import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserData } from "@/context/UserContext";
import { Loader } from "lucide-react";
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate()
  const {loginUser, btnLoading} = UserData()

  const submitHandler = () => {
    loginUser(email, navigate)
  };
  return (
    <div className="min-h-[60vh]">
      <Card className="md:w-100 sm:w-75 m-auto mt-8">
        <CardHeader>
          <CardTitle>Enter Email to get Otp</CardTitle>
          <CardDescription>
            if you have already got otp on mail then you can directly go to otp tab
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-x-1">
            <Label className="mb-2">Enter Email</Label>
            <Input type="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)} 
           />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={btnLoading} onClick={submitHandler}>
           {btnLoading? <Loader /> : "Submit"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login
