const AuthRepo = require('../module/auth/repository/authrepo');
const { comparePassword } = require('../middleware/user_auth/auth');
const transporter = require('../config/emailtransporter')
const userOTPverify = require('../helper/userOTPverify');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class apiAuthController {

    // Handle Register
    async register(req, res) {
        try {
            // Find email from database 
            const existingUser = await AuthRepo.findByEmail(req.body.email);
            // Same email not accpected
            if (existingUser) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["User already exists with this email"]
                });
            }
            // Password Validation
            if (!req.body.password) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Password is required"]
                });
            }
            if (!req.body.confirmPassword) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Please confirm your password"]
                });
            }
            if (req.body.password.length < 8) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Password should be at least 8 characters long"]
                });
            }
            if (req.body.password !== req.body.confirmPassword) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Password and confirm password do not match"]
                });
            }
            // Image Path Validation
            if (!req.file) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Profile image is required"]
                });
            }
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const userData = {
                ...req.body, password: hashedPassword, image: req.file.path, role: 'user'
            };
            const user = await AuthRepo.createUser(userData);
            // Sent OTP after successfull register
            userOTPverify(req, user)
            res.status(201).json({
                success: true,
                message: "Registration successfull and send otp in your email id",
                user
            })
        } catch (error) {
            const statusCode = error.name === 'ValidationError' ? 400 : 500;
            const message = error.name === 'ValidationError'
                ? { message: "Validation error", errors: Object.values(error.errors).map(err => err.message) }
                : { message: "An unexpected error occurred" }; // Other Field validation
            console.error(error);
            res.status(statusCode).json(message);
        }
    }

    // Verify OTP
    async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({ status: false, message: "All fields are required" });
            }
            const existingUser = await AuthRepo.findByEmail(email);
            if (!existingUser) {
                return res.status(404).json({ status: "failed", message: "Email doesn't exists" });
            }
            if (existingUser.is_verified) {
                return res.status(400).json({ status: false, message: "Email is already verified" });
            }
            const emailVerification = await AuthRepo.findByUserIdOtp(existingUser._id, otp)
            if (!emailVerification) {
                if (!existingUser.is_verified) {
                    await userOTPverify(req, existingUser);
                    return res.status(400).json({ status: false, message: "Invalid OTP, new OTP sent to your email" });
                }
                return res.status(400).json({ status: false, message: "Invalid OTP" });
            }
            // Check if OTP is expired
            const currentTime = new Date();
            // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
            const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
            if (currentTime > expirationTime) {
                // OTP expired, send new OTP
                await userOTPverify(req, existingUser);
                return res.status(400).json({ status: "failed", message: "OTP expired, new OTP sent to your email" });
            }
            // OTP is valid and not expired, mark email as verified
            existingUser.is_verified = true;
            await existingUser.save();

            // Delete email verification document
            await AuthRepo.deleteVerifyDocument(existingUser._id);
            return res.status(200).json({ status: true, message: "Email verified successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: "Unable to verify email, please try again later" });
        }
    }

    // Handle Login
    async login(req, res) {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({
                    message: "All fields are required"
                })
            }
            const user = await AuthRepo.findByEmail(email);
            if (!user) {
                return res.status(400).json({
                    message: "User not found"
                })
            }

            // Check if the user is a user
            if (user.role !== 'user') {
                return res.status(400).json({
                    message: "Only user can access website"
                })
            }

            // Check if user verified
            if (!user.is_verified) {
                return res.status(401).json({ status: false, message: "Your account is not verified" });
            }
            const isMatch = comparePassword(password, user.password)
            if (!isMatch) {
                return res.status(400).json({
                    message: "Invalid credentials"
                })
            }
            const token = jwt.sign({
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                image: user.image,
                role: user.role
            }, process.env.USER_API_KEY,
                { expiresIn: "1d" })
            res.status(200).json({
                success: true,
                message: "User login successfully",
                data: {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    image: user.image,
                    role: user.role
                },
                token: token
            })
        } catch (error) {
            console.log(error);

        }

    }

    // Fetching Dashboard Data 
    async dashboard(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized access. No user information found." });
            }
            console.log("User Data:", user);
            res.status(200).json({
                message: `Welcome,${user.first_name}`,
                user: user
            });
        } catch (error) {
            console.error("Server Error:", error.message);
            res.status(500).json({ message: "Server error" });
        }
    }

    // Reset password link 
    async resetPasswordLink(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ status: false, message: "Email field is required" });
            }
            const user = await AuthRepo.findByEmail(email); 
            if (!user) {
                return res.status(404).json({ status: false, message: "Email doesn't exist" });
            }
            // Generate token for password reset
            const secret = user._id + process.env.USER_API_KEY;
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '5m' });
            console.log("My forget token...", token)
            // Reset Link and this link generate by frontend developer
            // FRONTEND_HOST_FORGETPASSWORD = http://localhost:3004/forgetpassword
            const resetLink = `${process.env.FRONTEND_HOST_FORGETPASSWORD}/${user._id}/${token}`;
            // Send password reset email  
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: "Password Reset Link",
                // html: `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">Click here</a> to reset your password.</p>`
                html: 'Your email is sucessfully verified'
            });
            // Send success response
            res.status(200).json({ status: true, message: "Your email is verified now you can change your password", user, token });
        } catch (error) {
            console.log(error);
            return res.status(401).json({ message: "Something went wrong" })

        }
    }

    // Forget Password
    async forgotPassword(req, res) {
        try {
            const { id, token } = req.params;
            const { password, confirmPassword } = req.body;
            const user = await AuthRepo.findById(id)
            console.log("My user...", user)
            if (!user) {
                return res.status(404).json({ status: false, message: "User not found" });
            }
            // Validate token check 
            const new_secret = user._id + process.env.USER_API_KEY;
            jwt.verify(token, new_secret);

            if (!password || !confirmPassword) {
                return res.status(400).json({ status: false, message: "New Password and Confirm New Password are required" });
            }

            if (password.length < 8) {
                return res.status(400).json({ status: false, message: "Password should be atleast 8 characters long" })
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ status: false, message: "New Password and Confirm New Password don't match" });
            }
            // Generate salt and hash new password
            const salt = await bcrypt.genSalt(10);
            const newHashPassword = await bcrypt.hash(password, salt);

            // Update user's password
            await AuthRepo.findByIdHashpassword(user._id, newHashPassword);

            // Send success response
            res.status(200).json({ status: "success", message: "Password reset successfully" });

        } catch (error) {
            console.log("My password..", error);
            return res.status(401).json({ message: "Error updating password" })
        }
    }



}

module.exports = new apiAuthController();