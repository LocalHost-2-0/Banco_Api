import Product from "./product.model.js"


export const getProducts = async (req, res) => {
    try{ 
        
        const products = await Product
        .find({ status: true })
        .sort({ createdAt: -1 });

        if(products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontraron productos"
            })
        }
        res.status(200).json({
            success: true,
            message: "Productos obtenidos correctamente",
            products
        })

    }catch(error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los productos",
            error: error.message
        })
    }
}

export const addProduct = async (req, res) => {
    try { 
        const data = req.body;
        
        if (req.file) {
            data.image = req.file.path;
        }

        const product = new Product(data);
        await product.save();
        
        res.status(200).json({
            success: true,
            message: "Producto agregado correctamente",
            product
        });

    } catch(error) {
        res.status(500).json({
            success: false,
            message: "Error al agregar el producto",
            error: error.message
        });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const currentProduct = await Product.findById(id);
        
        if (!currentProduct) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            });
        }
        if (req.file) {
            data.image = req.file.path;
            
            if (currentProduct.image) {
                try {

                    const publicId = currentProduct.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`products/${publicId}`);
                } catch (error) {
                    console.error("Error al eliminar la imagen anterior:", error);
                }
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            message: "Producto actualizado correctamente",
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el producto",
            error: error.message
        });
    }
}


export const deactivateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            });
        }

        product.status = !product.status;
        await product.save();

        res.status(200).json({
            success: true,
            message: `Producto ${product.status ? "activado" : "desactivado"} correctamente`,
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al cambiar el estado del producto",
            error: error.message
        });
    }
}

export const searchProduct = async (req, res) => {
    try {
        const { name } = req.params;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Debe proporcionar un nombre para buscar"
            });
        }

        const regex = new RegExp(name, 'i'); 

        const products = await Product.find({
            name: regex,
            status: true 
        }).sort({ createdAt: -1 });

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontraron productos con ese nombre"
            });
        }

        res.status(200).json({
            success: true,
            message: "Productos encontrados",
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al buscar productos",
            error: error.message
        });
    }
};

