import Transaction from "./transaction.model.js"
import User from "../user/user.model.js"
import Wallet from "../wallet/wallet.model.js"
import { validateTransactionDayLimit } from "../helpers/transaction-limitator.js"

export const createTransaction = async (req, res) => {
    try {
        const { receiver, sender, amount, typeSend, typeRecive } = req.body

        const typeOfAccountSender = {
            monetary: "noAccountBalance",
            saving: "savingAccountBalance",
            foreing: "foreingCurrencyBalance"
        }
        const typeOfAccountReceiver = {
            monetary: "noAccountBalance",
            saving: "savingAccountBalance",
            foreing: "foreingCurrencyBalance"
        }
        const typeAccountSend = typeOfAccountSender[typeSend]
        const typeAccountReceiver = typeOfAccountReceiver[typeRecive]

        const receiverUser = await User.findById(receiver)
        const senderUser = await User.findById(sender)

        const validator = await Wallet.findById(senderUser.wallet)
        if (validator[typeAccountSend] < amount) {
            return res.status(500).json({
                success: false,
                message: "El balance para efectuar la transacción es insuficiente"
            })
        }

        try {
            await validateTransactionDayLimit(sender)
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error al ejecutar la transacción, limite diario alcanzado",
            })
        }

        await Promise.all([
            Wallet.findByIdAndUpdate(receiverUser.wallet, { $inc: { [typeAccountReceiver]: amount } }, { new: true }),
            Wallet.findByIdAndUpdate(senderUser.wallet, { $inc: { [typeAccountSend]: -amount } }, { new: true })
        ])

        const type = typeRecive
        const typeSender = typeSend
        const transactionSucces = await Transaction.create({ receiver, sender, amount, type, typeSender })

        await Promise.all([
            User.findByIdAndUpdate(sender, { $addToSet: { historyOfSend: transactionSucces._id } }, { new: true }),
            User.findByIdAndUpdate(receiver, { $addToSet: { historyOfRecive: transactionSucces._id } }, { new: true })
        ])

        res.status(201).json({
            success: true,
            message: "Transacción ejecutada con éxito",
            transactionSucces
        })

        const timeout = setTimeout(async () => {
            try {
                await Transaction.findByIdAndUpdate(transactionSucces._id, { status: "FINALLY" }, { new: true })
            } catch (error) {
                console.log("Error al setear el status")
            }
        }, 120000)

        const interval = setInterval(async () => {
            try {
                const updatedTransaction = await Transaction.findById(transactionSucces._id)
                if (updatedTransaction?.status === "REVERTED") {
                    clearTimeout(timeout)
                    clearInterval(interval)
                    console.log("Timeout cancelado porque la transacción fue revertida")
                }
            } catch {
                
            }
        }, 5000)

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al ejecutar la transacción",
            error: error.message
        })
    }
}


export const revertTransaction = async (req, res) => {
    try {
        const { uid } = req.params;

        const transaction = await Transaction.findById(uid);

        if (transaction.status === "FINALLY") {
            return res.status(400).json({
                success: false,
                message: "No se puede revertir la transacción, tiempo límite excedido",
            });
        }
        if (transaction.status === "REVERTED") {
            return res.status(400).json({
                success: false,
                message: "La transacción ya fue revertida",
            });
        }

        const typeOfAccount = {
            monetary: "noAccountBalance",
            saving: "savingAccountBalance",
            foreing: "foreingCurrencyBalance",
        };

        const accountReceiver = typeOfAccount[transaction.type];
        const accountSender = typeOfAccount[transaction.typeSender];

        const senderUser = await User.findById(transaction.sender);
        const receiverUser = await User.findById(transaction.receiver);

        const senderWalletId = senderUser.wallet;
        const receiverWalletId = receiverUser.wallet;

        await Transaction.findByIdAndUpdate(uid, { status: "REVERTED" }, { new: true });

        await Wallet.findByIdAndUpdate(receiverWalletId, { $inc: { [accountReceiver]: -transaction.amount } }, { new: true });
        await Wallet.findByIdAndUpdate(senderWalletId, { $inc: { [accountSender]: transaction.amount } }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Transacción revertida con éxito",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al ejecutar la reversión",
            error: error.message,
        });
    }
}; 