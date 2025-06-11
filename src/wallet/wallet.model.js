import { Schema, model } from "mongoose";

const walletSchema = Schema({
    noAccount: {
        type: Number
    },
    noAccountBalance:{
        type: Number,
        default: 0
    },
    savingAccount: {
        type: Number
    },
    savingAccountBalance:{
        type: Number,
        default: 0
    },
    foreingCurrency: {
        type: Number
    },
    foreingCurrencyBalance:{
        type: Number,
        default: 0
    },
    
    user: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    status: {
        type: Boolean,
        default: true
    }
},
    {
        versionKey: false,
        timeStamps: true
    }
)

walletSchema.methods.toJSON = function () {
    const { _v, _id, ...wallet } = this.toObject()
    wallet.uid = _id;
    return wallet;
}

export default model("Wallet", walletSchema);