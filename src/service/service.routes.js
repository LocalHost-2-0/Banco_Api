import {Router} from 'express';
import {getServices, addService, updateService, deactivateService, searchService, assignServiceToUser, removeServiceFromUser, getUserServices} from "./service.controller.js";
import {addServiceValidator, updateServiceValidator, deactivateServiceValidator, searchServiceValidator, assignServiceToUserValidator, removeServiceFromUserValidator, getUserServicesValidator} from "../middlewares/service-validators.js";
import { uploadServiceImage, handleUploadErrors } from '../middlewares/cloudinary-uploads.js';

const router = Router()

router.get("/", getServices);

router.post("/agregar", uploadServiceImage, handleUploadErrors, addServiceValidator, addService
)

router.put("/actualizar/:id", uploadServiceImage, handleUploadErrors, updateServiceValidator, updateService
)

router.patch("/desactivar/:id", deactivateServiceValidator, deactivateService);

router.get("/buscar/:name", searchServiceValidator, searchService);

router.post("/asignar", assignServiceToUserValidator, assignServiceToUser);

router.delete("/eliminar", removeServiceFromUserValidator, removeServiceFromUser);

router.get("/usuario/:userId", getUserServicesValidator, getUserServices);

export default router;