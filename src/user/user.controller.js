import User from "./user.model.js";
import argon2 from "argon2";

export const getUserById = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener el usuario",
      error: err.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { limite = 5, desde = 0 } = req.query;
    const query = { status: true };

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).skip(Number(desde)).limit(Number(limite)),
    ]);

    return res.status(200).json({
      success: true,
      total,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      error: err.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { uid } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(uid);

    const matchOldAndNewPassword = await argon2.verify(
      user.password,
      newPassword
    );

    if (matchOldAndNewPassword) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña no puede ser igual a la anterior",
      });
    }

    const encryptedPassword = await argon2.hash(newPassword);

    await User.findByIdAndUpdate(
      uid,
      { password: encryptedPassword },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar contraseña",
      error: err.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const data = { ...req.body };

    if ('dpi' in data) delete data.dpi;
    if ('password' in data) delete data.password;

    const user = await User.findByIdAndUpdate(uid, data, { new: true });

    res.status(200).json({
      success: true,
      msg: "Usuario Actualizado",
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error al actualizar usuario",
      error: err.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findByIdAndUpdate(
      uid,
      { status: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      msg: "Usuario Eliminado",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al eliminar el usuario",
      error: err.message,
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { limite = 5, desde = 0 } = req.query;
    const query = { status: true };

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .select("historyOfSend historyOfReceive"),
    ]);

    return res.status(200).json({
      success: true,
      total,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      error: err.message,
    });
  }
};


export const addFavorite = async (req, res) => {
  try {

    const userId = req.usuario._id || req.usuario.uid

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario no proporcionado",
      })
    }

    const { accountNumber } = req.body;
    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "El número de cuenta es requerido",
      })
    }

    const user = await User.findById(userId)
    console.log('Usuario encontrado:', user)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario autenticado no encontrado en la base de datos",
      })
    }
    const favoriteUser = await User.findOne({ numberAccount: accountNumber });
    if (!favoriteUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario con ese número de cuenta no encontrado",
      })
    }

    if (user._id.equals(favoriteUser._id)) {
      return res.status(400).json({
        success: false,
        message: "No puedes agregarte a ti mismo como favorito",
      })
    }

    if (user.favorites.includes(favoriteUser._id)) {
      return res.status(400).json({
        success: false,
        message: "Este usuario ya está en tus favoritos",
      })
    }

    user.favorites.push(favoriteUser._id);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Usuario agregado a favoritos",
      favorites: user.favorites,
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al agregar favorito",
      error: err.message,
    })
  }
}



export const getFavorites = async (req, res) => {
  try {

    const userId = req.usuario._id || req.usuario.uid

    const user = await User.findById(userId).populate('favorites', 'name userName numberAccount email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      favorites: user.favorites,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener favoritos",
      error: err.message,
    });
  }
};

export const getBalance = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById(uid).select("wallet").populate("wallet")

    return res.status(200).json({
      success: true,
      balance: {
        noAccountBalance: user.wallet.noAccountBalance,
        savingAccountBalance: user.wallet.savingAccountBalance,
        foreingCurrencyBalance: user.wallet.foreingCurrencyBalance
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      error: err.message,
    });
  }
};