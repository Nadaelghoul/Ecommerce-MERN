import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    phone : {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }

});


export const Address = mongoose.model("Address", addressSchema);