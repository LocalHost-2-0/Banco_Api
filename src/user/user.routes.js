import { Router } from "express";
import { getUserById, getUsers, updatePassword, updateUser, deleteUser, getHistory } from "./user.controller.js";
import { getUserByIdValidator, updatePasswordValidator, updateUserValidator, deleteUserValidator } from "../middlewares/user-validators.js";

const router = Router();

/**
 * @swagger
 * /user/getUserById/{uid}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get(
    "/getUserById/:uid",
    getUserByIdValidator,
    getUserById
);

/**
 * @swagger
 * /user/getUser:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get(
    "/getUser",
    getUsers
);

/**
 * @swagger
 * /user/updatePassword/{uid}:
 *   patch:
 *     summary: Update user password
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Bad request
 */
router.patch(
    "/updatePassword/:uid",
    updatePasswordValidator,
    updatePassword
);

/**
 * @swagger
 * /user/updateUser/{uid}:
 *   patch:
 *     summary: Update user information
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Bad request
 */
router.patch(
    "/updateUser/:uid",
    updateUserValidator,
    updateUser
);

/**
 * @swagger
 * /user/deleteUser/{uid}:
 *   patch:
 *     summary: Delete user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.patch(
    "/deleteUser/:uid",
    deleteUserValidator,
    deleteUser
);

/**
 * @swagger
 * /user/getHistoryOfTransactions/{uid}:
 *   get:
 *     summary: Obtener historial de transacciones del usuario
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Historial de transacciones obtenido correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
    "/getHistoryOfTransactions/:uid",
    getHistory
)

export default router;