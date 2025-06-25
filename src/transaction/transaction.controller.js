import Transaction from "./transaction.model.js"
import User from "../user/user.model.js"
import Wallet from "../wallet/wallet.model.js"
import { validateTransactionDayLimit } from "../helpers/transaction-limitator.js"
import { convert } from "../converter/converter.controller.js"

export const createTransaction = async (req, res) => {
    try {
        const { receiver, sender, amount, typeSend, typeRecive } = req.body
        let quetzalToDollar = false
        let dollarToQuetzal = false
        let flag = false
        let incrementAmount = false;
        let decrementAmount = amount;

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

        if (
            typeAccountReceiver === "foreingCurrencyBalance" &&
            typeAccountSend !== "foreingCurrencyBalance"
        ) {
            const conversion_result = await convert(amount, "GTQ", "USD")
            if (conversion_result.error) {
                return res.status(500).json({
                    success: false,
                    message: "Error al convertir la moneda"
                })
            }
            flag = true
            quetzalToDollar = true
            incrementAmount = parseInt(conversion_result.result)
            decrementAmount = amount
        }

        if (
            typeAccountSend === "foreingCurrencyBalance" &&
            typeAccountReceiver !== "foreingCurrencyBalance"
        ) {
            const conversion_result = await convert(amount, "USD", "GTQ")
            if (conversion_result.error) {
                return res.status(500).json({
                    success: false,
                    message: "Error al convertir la moneda"
                })
            }
            flag = true
            dollarToQuetzal = true
            incrementAmount = parseInt(conversion_result.result)
            decrementAmount = amount
        }

        if (!flag) {
            incrementAmount = amount
            decrementAmount = amount
        }

        await Promise.all([
            Wallet.findByIdAndUpdate(
                receiverUser.wallet,
                { $inc: { [typeAccountReceiver]: incrementAmount } },
                { new: true }
            ),
            Wallet.findByIdAndUpdate(
                senderUser.wallet,
                { $inc: { [typeAccountSend]: -decrementAmount } },
                { new: true }
            )
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

export const getTransacionHistory = async (req, res) => {
    try {
        const {uid} = req.params;
        const user = await User.findById(uid).select("historyOfRecive historyOfSend")
        

        return res.status(200).json({
            success: true,
            user
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los usuarios",
            error: err.message,
        });
    }
}


export const depositTransaction = async (req, res) => {
    try {
        const { receiver, sender, amount, type } = req.body
        const receiverUser = await User.findById(receiver)
        const receiverWallet = await Wallet.findById(receiverUser.wallet)
        const typeSender = "Deposit"
        const typeOfAccount = {
            monetary: "noAccountBalance",
            saving: "savingAccountBalance",
            foreing: " foreingCurrencyBalance"
        }
        const typeAcountSender = typeOfAccount[type]

        await Wallet.findByIdAndUpdate(receiverWallet._id, { [typeAcountSender]: amount }, { new: true })

        const transactionDeposit = await Transaction.create({ receiver, sender, amount, type, typeSender })

        return res.status(201).json({
            success: true,
            message: "Deposito realizado con éxito",
            transactionDeposit
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al ejecutar el deposito",
            error: error.message
        })
    }
}

export const updateDepositTransaction = async (req, res) => {
    try {
        const { uid } = req.params
        const { amount } = req.body

        const transaction = await Transaction.findByIdAndUpdate(uid, { amount: amount }, { new: true })
        res.status(200).json({
            success: true,
            message: "Deposito Actualizado con éxito",
            transaction
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al actualizar el deposito",
            error: error.message
        })
    }
}

export const updateTransaction = async (req, res) => {
    try {
        const { uid } = req.params;
        const { amount } = req.body;

        const transaction = await Transaction.findById(uid);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transacción no encontrada"
            });
        }

        const senderUser = await User.findById(transaction.sender);
        const receiverUser = await User.findById(transaction.receiver);
        const senderWallet = await Wallet.findById(senderUser.wallet);
        const receiverWallet = await Wallet.findById(receiverUser.wallet);

        const typeOfAccountSender = {
            monetary: "noAccountBalance",
            saving: "savingAccountBalance",
            foreing: "foreingCurrencyBalance"
        };

        const typeOfAccountReceiver = {
            monetary: "noAccountBalance",
            saving: "savingAccountBalance",
            foreing: "foreingCurrencyBalance"
        };

        const typeAccountSend = typeOfAccountSender[transaction.typeSender];
        const typeAccountReceiver = typeOfAccountReceiver[transaction.type];

        const difference = amount - transaction.amount;

        if (difference < 0) {
            if (senderWallet[typeAccountSend] < Math.abs(difference)) {
                return res.status(400).json({
                    success: false,
                    message: "El balance para efectuar la actualización es insuficiente"
                });
            }
            await Promise.all([
                Wallet.findByIdAndUpdate(receiverWallet._id, { $inc: { [typeAccountReceiver]: -Math.abs(difference) } }, { new: true }),
                Wallet.findByIdAndUpdate(senderWallet._id, { $inc: { [typeAccountSend]: Math.abs(difference) } }, { new: true }),
            ]);
        } else {
            if (receiverWallet[typeAccountReceiver] < Math.abs(difference)) {
                return res.status(400).json({
                    success: false,
                    message: "El balance para efectuar la actualización es insuficiente"
                });
            }
            await Promise.all([
                Wallet.findByIdAndUpdate(receiverWallet._id, { $inc: { [typeAccountReceiver]: Math.abs(difference) } }, { new: true }),
                Wallet.findByIdAndUpdate(senderWallet._id, { $inc: { [typeAccountSend]: -Math.abs(difference) } }, { new: true }),
            ]);
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(uid, { amount: amount }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Transacción actualizada con éxito",
            updatedTransaction
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al actualizar la transacción",
            error: error.message
        });
    }
};