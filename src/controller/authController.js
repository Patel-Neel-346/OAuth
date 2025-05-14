// Add these implementations to your authController.js

export const Logout = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Clear the refresh token in the database
    user.refreshToken = null;
    await user.save();

    // Clear cookies
    res.clearCookie("refreshToken");
    res.clearCookie("authToken");

    res.status(200).json(new ApiRes(200, null, "Successfully logged out"));
  } catch (error) {
    next(new ApiError(500, "Logout failed"));
  }
});

export const GetUserProfile = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    res.status(200).json(new ApiRes(200, { user }));
  } catch (error) {
    next(new ApiError(500, "Failed to get user profile"));
  }
});

export const AuthSuccess = asyncHandler(async (req, res, next) => {
  // This can be used to send a success page or redirect to the frontend
  res.status(200).json(
    new ApiRes(200, {
      success: true,
      message: "Authentication successful",
    })
  );
});

export const FacebookCallback = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // Generate tokens
  const authToken = generateAuthToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie("authToken", authToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  // Redirect to frontend or send response
  res.redirect(`/auth/success?token=${authToken}`);
});
