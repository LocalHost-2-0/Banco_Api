import { Router } from "express";
import { createTransaction, revertTransaction } from "./transaction.controller.js";
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

export default router