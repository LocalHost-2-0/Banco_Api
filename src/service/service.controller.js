import Service from "./service.model.js"
import cloudinary from "../middlewares/cloudinary-uploads.js";

export const getServices = async (req, res) => {
    try {
        const services = await Service
            .find({ status: true })
            .sort({ createdAt: -1 });

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No services found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Services retrieved successfully",
            services
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving services",
            error: error.message
        });
    }
}


export const addService = async (req, res) => {
    try {
        const data = req.body;
        
        if (req.file) {
            data.image = req.file.path;
        }

        const service = new Service(data);
        await service.save();

        res.status(200).json({
            success: true,
            message: "Service added successfully",
            service
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding service",
            error: error.message
        });
    }
}

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (req.file) {

            const oldService = await Service.findById(id);
            if (oldService.image) {
                const publicId = oldService.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`services/${publicId}`);
            }

            const result = await cloudinary.uploader.upload(req.file.path);
            data.image = result.secure_url;
        }

        const updatedService = await Service.findByIdAndUpdate(id, data, { new: true });
        
        if (!updatedService) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            service: updatedService
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating service",
            error: error.message
        });
    }
}

export const deactivateService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Servicio no encontrado"
            });
        }

        service.status = !service.status; 
        await service.save();

        res.status(200).json({
            success: true,
            message: `Servicio ${service.status ? "activado" : "desactivado"} correctamente`,
            service
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al cambiar el estado del servicio",
            error: error.message
        });
    }
};

export const searchService = async (req, res) => {
    try {
        const { name } = req.params;

        const services = await Service
            .find({ name: new RegExp(name, "i"), status: true })
            .sort({ createdAt: -1 });

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No services found with that name"
            });
        }

        res.status(200).json({
            success: true,
            message: "Services retrieved successfully",
            services
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error searching for services",
            error: error.message
        });
    }
}