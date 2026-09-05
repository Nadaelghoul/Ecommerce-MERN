import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import sendOrderConfirmation from "../utils/sendOrderConfirmation.js";
import Stripe from 'stripe';

export const newOrderCod = async(req, res) => {
    try {
      const {method, phone, address} = req.body;
      const cart = await Cart.find({user: req.user._id}).populate({
        path: "product",
        select: "title price",
      });
      if(!cart.length){
        return res.status(400).json({ message: "Cart is empty" }); 
      }
      let subTotal = 0;

       const items =  cart.map((i) => {
        const itemSubTotal = i.product.price * i.quantity;
        subTotal+= itemSubTotal;
         
        return{
            product: i.product._id,
            name: i.product.title,
            price: i.product.price,
            quantity: i.quantity,
        };
      });

      const order = await Order.create({
        items,
        method,
        phone,
        address,
        user: req.user._id,
        subTotal
      });

      for(let i of order.items){
        const product = await Product.findById(i.product)

        if(product){
            product.stock -= i.quantity;
            product.sold += i.quantity;

            await product.save();
        }
      }

      await Cart.deleteMany({user: req.user._id}); //deletes all cart documents belonging to that user.

      await sendOrderConfirmation({
        email: req.user.email,
        subject: "Order Confirmation",
        orderId: order._id,
        products: items,
        totalAmount: subTotal,
      })

      res.json({message: "order created successfully", order});

    } catch(error) {
        res.status(500).json({ message: error.message }); 
    }
};

export const getAllOrders = async(req, res) => {
    try {
      
        const orders = await Order.find({user: req.user._id});

        res.status(200).json({orders: orders.reverse() });

    } catch(error){
       res.status(500).json({ message: error.message });  
    }
};

export const getAllOrdersAdmin = async(req, res) => {
    try {
         if(req.user.role !== "admin"){
            res.status(403).json({ message: "you are not admin" }); 
         }

         const orders = await Order.find().populate("user").sort({ createdAt: -1});

        res.status(200).json(orders);

    } catch(error){
       res.status(500).json({ message: error.message });  
    }
};

export const getMyOrder = async(req, res) => {
    try {
        
       const order = await Order.findById(req.params.id).populate("items.product").populate("user");

        res.status(200).json(order);

    } catch(error){
       res.status(500).json({ message: error.message });  
    }
};

export const updateStatus = async(req, res) => {
    try {
         if(req.user.role !== "admin"){
            res.status(403).json({ message: "you are not admin" }); 
         }

          const order = await Order.findById(req.params.id);

          const {status} = req.body;

          order.status = status;

          await order.save();

        res.status(200).json({message: "order status updated", order });

    } catch(error){
       res.status(500).json({ message: error.message });  
    }
};

export const getStatus = async(req, res) => {
       try {  

         if(req.user.role !== "admin"){
            res.status(403).json({ message: "you are not admin" }); 
         }
          const cod = await Order.find({method: "cod"}).countDocuments();
          const online = await Order.find({method: "online"}).countDocuments();

          const products = await Product.find()

          const data = products.map((prod) => ({
            name: prod.title,
            sold: prod.sold,
          }));

        res.status(200).json({
             cod,
             online,
             data });

    } catch(error){
       res.status(500).json({ message: error.message });  
    }
};

import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.Stripe_Secret_Key);

export const newOrderOnline = async(req,res) => {
  try {
   const {method, phone, address} = req.body

   const cart = await Cart.find({user: req.user._id}).populate("product");
   if(!cart.length) {
    return res.status(400).json({message: "Cart is empty"})
   }

   const subTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
   //preparing the products in your cart for Stripe Checkout. It converts your cart data into the format Stripe expects for its line_items.
   const lineItems = cart.map((item) =>({
    price_data: {
    currency: "egp",
    product_data: {
      name: item.product.title,
      images: [item.product.images[0].url],
    },
    unit_amount: Math.round(item.product.price * 100),  //Stripe expects the amount in the smallest unit of the currency.
    },
    quantity: item.quantity
   }));

   const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.Frontend_Url}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.Frontend_Url}/cart`,
    metadata: {
      userId: req.user._id.toString(),
      method,
      phone,
      address,
      subTotal,
    },
   });

   res.json({url: session.url}); //sends the Stripe Checkout URL to frontend

  } catch(error) {
    console.log("Error creating Stripe session:", error.message);
    res.status(500).json({
      message:"Failed to create payment session"
    });
  }
};

export const verifyPayment = async(req,res) => {
  try {
     const {sessionId} = req.body

     const session = await stripe.checkout.sessions.retrieve(sessionId);

     const {userId, method, phone, address, subTotal } = session.metadata;

     const cart = await Cart.find({user: userId}).populate("product");

     const items = cart.map((i)=>{
       return{
        product: i.product._id,
        name: i.product.title,
        price: i.product.price,
        quantity: i.quantity
       }
     });

      if(cart.length === 0) {
      return res.status(400).json({message: "Cart is empty"})
      }

      const existingOrder = await Order.findOne({ paymentInfo: sessionId});

      if(!existingOrder){
        const order = await Order.create({
          items: cart.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
          })),
          method,
          user: userId,
          phone,
          address,
          subTotal,
          paidAt: new Date(),
          paymentInfo: sessionId,
        });
        for(let i of order.items){
        const product = await Product.findById(i.product)

        if(product){
            product.stock -= i.quantity;
            product.sold += i.quantity;

            await product.save();
        }
      }

      await Cart.deleteMany({user: req.user._id}); //deletes all cart documents belonging to that user.

      await sendOrderConfirmation({
        email: req.user.email,
        subject: "Order Confirmation",
        orderId: order._id,
        products: items,
        totalAmount: subTotal,
      });
       
      return res.status(201).json({success: true, message: "Order created Successfully", order})
      };

  } catch(error) {
    console.log("Error verifying payment", error.message);
    res.status(500).json({message: error.message});
  }
}