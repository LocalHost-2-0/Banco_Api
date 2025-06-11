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
    const data = req.body;

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
      .select("historyOfSend")
      .select("historyOfReceive"),
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
