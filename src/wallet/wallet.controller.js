import Wallet from "./wallet.model.js";
import User from "../user/user.model.js"

export const createAccount = async (req, res) => {
    try {
        const data = req.body;

        const monetary = await numberVerificationAccount("monetary");
        const saving = await numberVerificationAccount("saving");
        const foreign = await numberVerificationAccount("foreing");

        data.noAccount = monetary;
        data.savingAccount = saving;
        data.foreingCurrency = foreign;

        const wallet = await Wallet.create(data);
        const user = await User.findByIdAndUpdate(data.user, { wallet: wallet._id }, { new: true });
        const balance = await User.findById(data.user)
        await Wallet.findByIdAndUpdate(wallet._id, { $inc: { noAccountBalance: balance.monthEarnings } })

        return res.status(200).json({
            success: true,
            message: "Cuentas generadas correctamente",
            response: {
                noAccount: monetary,
                savingAccount: saving,
                foreignCurrency: foreign
            },
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Cuentas no han podido ser creadas",
            error: error.message,
        });
    }
};

export const numberVerificationAccount = async (type) => {
    try {
        const random = () => Math.floor(Math.random() * 10);

        const ansMap = {
            monetary: 30,
            saving: 36,
            foreing: 42
        };

        const ans = ansMap[type];
        if (!ans) {
            console.log("Tipo no reconocido");
            return null;
        }

        let x, y, z, s;
        let flag = false;
        const arrayControl = [];

        while (!flag) {
            x = random();
            y = random();
            z = random();
            if ((x + z) * y === ans) flag = true;
        }

        arrayControl.push(x, y, z);
        s = random();
        arrayControl.push(s);

        const sum = arrayControl.reduce((a, b) => a + b, 0);
        const mod1 = (x * y + z) % 10;
        const pow = Math.pow(s + 1, 2) % 10;

        const controlDecimal = (sum + mod1 + pow) / 3;
        const [dec1, dec2] = controlDecimal.toFixed(1).split(".").map(Number);

        const baseDigits = [...arrayControl, mod1, pow, dec1];
        const digitSum = baseDigits.reduce((a, b) => a + b, 0);
        const verifier = digitSum % 10;

        const card = arrayControl.reduce((a, b) => a + b, 0);
        const digits = card.toString().split("").map(Number);
        const last = digits.length >= 2 ? digits[0] + digits[1] : digits[0];

        let reordered = [
            arrayControl[2],
            mod1,
            arrayControl[0],
            pow,
            dec1,
            arrayControl[1],
            s,
            dec2,
            verifier,
            last,
        ];
        let result = Number(reordered.join(""));
        return result;
    } catch (error) {
        throw new Error("Number generation failed: " + error);
    }
};

export const addFavoriteAccount = async(req,res) =>{
    try{
        const {typeAccount} = req.body;
        const {uid} = req.body;
        const wallet = await  Wallet.findById(uid);

        const accounts = {
            noAccount: wallet.noAccount,
            savingAccount: wallet.savingAccount,
            foreingCurrency: wallet.foreingCurrency
        }
        const account = accounts[typeAccount];


        const accountFav = await Wallet.findByIdAndUpdate(uid, {$addToSet: {favoriteAccount: account}}, {new: true})

        return res.status(200).json({
            success: true,
            message: "La cuenta se ha agregado a favoritos exitosamente",
            accountFav
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "No se ha podido agregar la cuenta a favoritos"
        })
    }
}