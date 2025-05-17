const User = require('../db/Users');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/JWT');

// middleware
exports.checkOwnership = (req, res, next) => {
    if (req.params.id !== req.user.id) {
        return res.status(403).json({ msg: "Nu ai permisiunea să accesezi acest resursă!" });
    }
    next();
};

// Signup
exports.signup = async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: "Email folosit" });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ msg: "Parolele nu se potrivesc." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // debugging
        console.log('User ID pentru token:', user._id);
        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

        const token = generateToken(user._id);
        res.status(201).json({
            msg: "Utilizator creat cu succes!",
            token,
            user: { _id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ msg: "Eroare la crearea contului", error: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Email sau parolă incorectă" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Email sau parolă incorectă" });
        }

        const token = generateToken(user._id, rememberMe ? '7d' : '1h');

        res.status(200).json({
            msg: "Autentificare reușită!",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            }
        });

    } catch (err) {
        res.status(500).json({ msg: "Eroare la autentificare", error: err.message });
    }
};

// update user profile
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { username, email, profileImage: newProfileImage } = req.body;
    const uploadedImage = req.file ? `/uploads/profile/${req.file.filename}` : undefined;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "Utilizatorul nu a fost găsit" });

        if (username) {
            const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUsername) return res.status(400).json({ msg: "Username deja folosit" });
            user.username = username;
        }

        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) return res.status(400).json({ msg: "Email deja folosit" });
            user.email = email;
        }

        if (uploadedImage) {
            user.profileImage = uploadedImage;
        } else if (newProfileImage !== undefined) {
            user.profileImage = newProfileImage;
        }

        await user.save();

        res.status(200).json({
            msg: "Datele utilizatorului au fost actualizate",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        });
    } catch (err) {
        console.error('Eroare în updateUser:', err);
        res.status(500).json({ msg: "Eroare la actualizarea datelor", error: err.message });
    }
};

// change pw
exports.changePassword = async (req, res) => {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "Utilizatorul nu a fost găsit" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Parola curentă este incorectă" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ msg: "Parola a fost actualizată cu succes" });
    } catch (err) {
        res.status(500).json({ msg: "Eroare la schimbarea parolei", error: err.message });
    }
};