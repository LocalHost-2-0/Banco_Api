import {Router} from 'express';

import {getProducts, addProduct, updateProduct, deactivateProduct, searchProduct} from "./product.controller.js"

import {addProductValidator, updateProductValidator, deactivateProductValidator, searchProductValidator} from "../middlewares/product-validator.js";

const router = Router()

router.get("/", getProducts);

router.post("/agregar", addProductValidator ,addProduct);

router.put("/actualizar/:id", updateProductValidator ,updateProduct);

router.patch("/desactivar/:id", deactivateProductValidator ,deactivateProduct);

router.get("/buscar/:name", searchProductValidator ,searchProduct);


export default router;