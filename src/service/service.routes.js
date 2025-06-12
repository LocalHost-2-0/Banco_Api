import {Router} from 'express';
import {getServices, addService, updateService, deactivateService, searchService} from "./service.controller.js";
import {addServiceValidator, updateServiceValidator, deactivateServiceValidator, searchServiceValidator} from "../middlewares/service-validators.js";
import { uploadServiceImage, handleUploadErrors } from '../middlewares/cloudinary-uploads.js';

const router = Router()

router.get("/", getServices);

router.post("/agregar", uploadServiceImage, handleUploadErrors, addServiceValidator, addService
)

router.put("/actualizar/:id", uploadServiceImage, handleUploadErrors, updateServiceValidator, updateService
)

router.patch("/desactivar/:id", deactivateServiceValidator, deactivateService);

router.get("/buscar/:name", searchServiceValidator, searchService);

export default router;