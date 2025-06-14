import {Router} from 'express';

import {getProducts,
    addProduct,
    updateProduct, 
    deactivateProduct, 
    searchProduct, 
    assignProductToUser,
    removeProductFromUser,
    getUserProducts
    } from "./product.controller.js"

import {addProductValidator, 
    updateProductValidator, 
    deactivateProductValidator, 
    searchProductValidator, 
    assignProductToUserValidator,
    removeProductFromUserValidator,
    getUserProductsValidator} from "../middlewares/product-validator.js";

import { uploadProductImage, handleUploadErrors } from '../middlewares/cloudinary-uploads.js';

const router = Router()

router.get("/", getProducts);

router.post("/agregar", uploadProductImage, addProductValidator, handleUploadErrors ,addProduct);

router.put("/actualizar/:id", uploadProductImage, updateProductValidator, handleUploadErrors ,updateProduct);

router.patch("/desactivar/:id", deactivateProductValidator ,deactivateProduct);

router.get("/buscar/:name", searchProductValidator ,searchProduct);

router.post("/asignar", assignProductToUserValidator ,assignProductToUser);

router.delete("/eliminar", removeProductFromUserValidator ,removeProductFromUser);

router.get("/usuario/:userId", getUserProductsValidator, getUserProducts);

export default router;
