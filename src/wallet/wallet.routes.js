import { Router } from "express";
import { createAccount, addFavoriteAccount } from "./wallet.controller.js";

const router = Router()

/**
 * @swagger
 * /wallet/create:
 *   get:
 *     summary: Create a new wallet account
 *     tags: [Wallet]
 *     responses:
 *       201:
 *         description: Wallet created
 *       400:
 *         description: Bad request
 */
router.get(
    "/create",
    createAccount
)

router.patch(
    "/addFavoriteAccount/:uid",
    addFavoriteAccount
)

export default router