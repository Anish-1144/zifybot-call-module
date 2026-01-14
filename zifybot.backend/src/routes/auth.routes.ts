import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from "../lib/jwt.utils";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = express.Router();

// Register a new user (default role: user)
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      res.status(400).json({
        status: "error",
        message:
          "Email, password, first name, last name, and phone number are required",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        status: "error",
        message: "User with this email already exists",
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with default role 'user'
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      role: "user",
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Login (for regular users)
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
      return;
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Login failed",
      error: error.message,
    });
  }
});

// Admin login (only allows admin role)
router.post("/admin/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
      return;
    }

    // Check if user is admin
    if (user.role !== "admin") {
      res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
      return;
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(200).json({
      status: "success",
      message: "Admin login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Admin login failed",
      error: error.message,
    });
  }
});

// Refresh token endpoint
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        status: "error",
        message: "Refresh token is required",
      });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user to ensure they still exist
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        status: "error",
        message: "User not found",
      });
      return;
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: any) {
    res.status(401).json({
      status: "error",
      message: "Invalid or expired refresh token",
      error: error.message,
    });
  }
});

// Get current user profile (protected route)
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select("-password");
    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
});

// Protected route example - accessible by all authenticated users
router.get("/protected", authenticate, (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "This is a protected route",
    user: req.user,
  });
});

// Admin only route example
router.get(
  "/admin/protected",
  authenticate,
  authorize("admin"),
  (req: Request, res: Response) => {
    res.status(200).json({
      status: "success",
      message: "This is an admin-only route",
      user: req.user,
    });
  }
);

export default router;
