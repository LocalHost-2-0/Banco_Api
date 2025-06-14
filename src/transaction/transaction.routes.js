import { Router } from "express";
import { createTransaction, revertTransaction , depositTransaction} from "./transaction.controller.js";
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

export default router