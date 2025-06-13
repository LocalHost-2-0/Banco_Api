import { Router } from "express";
import {
  createAccount,
  getAmountMoney,
  getMovementsByAccount,
} from "./wallet.controller.js";
import { getWalltValidator } from "../middlewares/wallet-validators.js";

const router = Router();

/**
 * @swagger
 * /wallet/create:
 *   get:
 *     summary: Crear una nueva cuenta de wallet
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Cuentas generadas correctamente
 *       400:
 *         description: Solicitud incorrecta
 *       500:
 *         description: Error interno del servidor
 */
router.get("/create", createAccount);

/**
 * @swagger
 * /wallet/balances/{userId}:
 *   get:
 *     summary: Obtener los saldos de las cuentas de un usuario
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Saldos obtenidos correctamente
 *       400:
 *         description: Solicitud incorrecta
 *       404:
 *         description: Wallet no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get("/balances/:userId", getWalltValidator, getAmountMoney);

/**
 * @swagger
 * /wallet/movements/{userId}:
 *   get:
 *     summary: Obtener los movimientos de todas las cuentas de un usuario, ordenados de mayor a menor
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Movimientos obtenidos correctamente
 *       400:
 *         description: Solicitud incorrecta
 *       404:
 *         description: Wallet no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get("/movements/:userId", getWalltValidator, getMovementsByAccount);

export default router;
