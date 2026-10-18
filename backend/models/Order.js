import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    items : [{
        quantity : {
            type: Number,
            required: true,
        },
        product : {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Product",
         required: true,
        }
    }],

    method: {
        type: String,
        required: true,
    },

    paymentInfo:{   // for online payment, we will store the payment info here(stripe`s session id)
       type: String,
    },

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, 
    },

    phone: {
      type: String,
      required: true, 
    },

    address: {
      type: String,
      required: true, 
    },

    status: {
      type: String,
      default: "pending",
    },

    paidAt: {
       type: String,
    },

    subTotal: {
     type: Number,
     required: true,
    },
},{
    timestamps: true,
});

export const Order = mongoose.model("Order", orderSchema);