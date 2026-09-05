import  { useEffect, useState } from 'react'
import { server } from "@/main"
import axios from "axios"
import Cookies from "js-cookie"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart, Label, Pie, PieChart, CartesianGrid, XAxis ,YAxis, Tooltip, Bar } from 'recharts';

function InfoPage() {
  const [cod, setCod] = useState(0);
  const [online, setOnline] = useState(0);
  const [data, setData] = useState([]);

  async function fetchStatus(){
    try{
      const {data} = await axios.get(`${server}/api/status`,{
        headers: {
          token: Cookies.get("token")
        },
      });
      setCod(data.cod);
      setOnline(data.online);
      setData(data.data);
    } catch(error){
      console.log(error);
    }
  };

  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();
  },[]);

  const paymentData = [
    {method: "online", users: online, fill: "#03bafc"},
    {method: "cod", users: cod, fill: "#8c1251"},
  ];

  const paymentChartConfig = {
    users: {
      label: "Users",
    },
    online: {
      label: "Online",
      color: "hls(var(--chart1))",
    },
    cod: {
      label: "COD",
      color: "hls(var(--chart2))",
    },
  };

  const paymentPercentage = paymentData.map((data) => ({
    ...data,
    percentage: parseFloat(((data.users / (online + cod)) * 100).toFixed(2)),
  }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Pie chart - Payment Methods</CardTitle>
          <CardDescription>Payment Breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer config={paymentChartConfig} className="mx-auto aspect-square max-h-62.5" >
            <PieChart>
             <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
             <Pie data={paymentData}
              dataKey="users"
               nameKey="method" 
               innerRadius={60} 
               strokeWidth={5} >
                <Label content={({viewBox}) => {
                  if(viewBox && "cx" in viewBox && "cy" in viewBox){
                    return <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline={"middle"} >
                       <tspan x={viewBox.cx} y={viewBox.cy} className="fill-muted-foreground text-xl font-bold">{online + cod} Users</tspan>
                    </text>
                  }
                }} />
             </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className='leading-none text-muted-foreground'>
            Showing total users for payment methods.
          </div>
        </CardFooter>
      </Card>

       <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Pie chart - Payment Percentage</CardTitle>
          <CardDescription>Payment Breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer config={paymentChartConfig} className="mx-auto aspect-square max-h-62.5" >
            <PieChart>
             <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
             <Pie data={paymentPercentage}
              dataKey={"percentage"}
               nameKey={"method"} 
               innerRadius={60} 
               strokeWidth={5} >
                <Label content={({viewBox}) => {
                  if(viewBox && "cx" in viewBox && "cy" in viewBox){
                    return <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline={"middle"} >
                       <tspan x={viewBox.cx} y={viewBox.cy} className="fill-muted-foreground text-xl font-bold">100%</tspan>
                    </text>
                  }
                }} />
             </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className='leading-none text-muted-foreground'>
            Displaying percentage distribution of payment methods.
          </div>
        </CardFooter>
      </Card>

      <Card >
        <CardHeader>
          <CardTitle>Bar chart - Products Sold</CardTitle>
          <CardDescription>Units sold per product</CardDescription>
        </CardHeader>
        <CardContent>
           <BarChart width={600} height={400} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50,}}>
             <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={"name"} tickLine={false} tickMargin={10} axisLine={false} />
           <YAxis />
             <Tooltip cursor={{ fill: "#f0f0f0" }} content={({ active, payload, label }) => {
               if (!active || !payload || payload.length === 0) {
                  return null;
                }
             return (
             <div className="rounded-md border bg-white p-3 shadow-md">
              <p className="font-semibold text-black"> {label} </p>
              <p className="text-sm text-gray-600"> Units Sold: {payload[0].value} </p>
             </div>
          );
          }}
          />

        <Bar  dataKey={"sold"} fill="#8884d8" radius={8} />
         </BarChart>
        </CardContent>
         <CardFooter className="flex-col gap-2 text-sm">
          <div className='leading-none text-muted-foreground'>
            Hover over a bar to see the product details.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default InfoPage
