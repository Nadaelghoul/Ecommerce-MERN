import { OTP }from "../models/Otp.js";
import { User } from "../models/User.js";
import sendOtp  from "../utils/sendOtp.js";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
    try {
       const { email } = req.body;

       const subject = "Ecommerce App";

       const otp = Math.floor(Math.random() * 1000000);

       const prevOtp = await OTP.findOne({ email });

         if(prevOtp){
            await prevOtp.deleteOne();
         }

         await sendOtp({email, subject, otp});

         await OTP.create({ email, otp });
         
         res.status(200).json({ message: "OTP sent  to your mail" });
       
    } catch (error) {
       res.status(500).json({ message: error.message }); 
    }
};


export const verifyUser = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const haveOtp = await OTP.findOne({ email, otp });

        if(!haveOtp){
          return res.status(400).json({ message: "Invalid OTP" });  
        }

        let user = await User.findOne({ email });

        if(user){
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "15d" });

            await haveOtp.deleteOne();

            res.status(200).json({ message: "Login successful", token, user });
        } else {
            user = await User.create({ email });

             const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "15d" });

            await haveOtp.deleteOne();

            res.status(200).json({ message: "Login successful", token, user });
        }
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

export const myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}