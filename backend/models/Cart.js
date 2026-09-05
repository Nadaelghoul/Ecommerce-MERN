import mongoose from "mongoose";

//one user can have multiple Cart documents, with each document representing one product with the quantity of it to add.

const cartSchema = new mongoose.Schema({
    product : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    quantity : {
        type: Number,
        required: true,
    },
    
     user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

});

export const Cart = mongoose.model("Cart", cartSchema);