import { Router } from "express";
import { createTransaction, revertTransaction , depositTransaction, updateDepositTransaction, updateTransaction} from "./transaction.controller.js";
import { createTransactionValidator } from "../middlewares/transaction-validator.js";

const router = Router()

router.post(
    "/createTransaction",
    createTransactionValidator,
    createTransaction
)

router.patch(
    "/revertTransaction/:uid",
    revertTransaction
)

router.post(
    "/depositTransaction",
    depositTransaction
)

router.patch(
    "/updateDeposit/:uid",
    updateDepositTransaction
)

router.patch(
    "/updateTransaction/:uid",
    updateTransaction
)

export default router