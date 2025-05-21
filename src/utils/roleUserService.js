import mongoose from "mongoose";
import User from "../models/User.js";
import { Role, ROLE_TYPES } from "../models/Role.js";
import LenderProfile from "../models/LenderProfile.js";
import BorrowerProfile from "../models/BorrowerProfile.js";

/**
 * Service class to handle the relationship between users, roles, and profiles
 */
class RoleUserService {
  /**
   * Assign a role to a user
   * @param {string} userId - The user ID
   * @param {string} roleName - The role name (from ROLE_TYPES)
   * @returns {Promise<Object>} - The updated role with users array
   */
  static async assignRoleToUser(userId, roleName) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate role name
      if (!Object.values(ROLE_TYPES).includes(roleName)) {
        throw new Error(`Invalid role name: ${roleName}`);
      }

      // Find user and role
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error("User not found");
      }

      let role = await Role.findOne({ name: roleName }).session(session);
      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }

      // Check if user is already assigned to this role
      if (role.users.includes(userId)) {
        await session.commitTransaction();
        return role;
      }

      // Add user to role
      role.users.push(userId);
      await role.save({ session });

      await session.commitTransaction();
      return role;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Create a lender profile for a role
   * @param {string} roleId - The lender role ID
   * @param {Object} profileData - The lender profile data
   * @returns {Promise<Object>} - The created lender profile
   */
  static async createLenderProfile(roleId, profileData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate that the role exists and is a LENDER type
      const role = await Role.findById(roleId).session(session);
      if (!role) {
        throw new Error("Role not found");
      }

      if (role.name !== ROLE_TYPES.LENDER) {
        throw new Error("Invalid role type. Must be a LENDER role.");
      }

      // Check if profile already exists
      const existingProfile = await LenderProfile.findOne({ roleId }).session(
        session
      );
      if (existingProfile) {
        throw new Error("Lender profile already exists for this role");
      }

      // Create lender profile
      const lenderProfile = new LenderProfile({
        roleId,
        ...profileData,
      });

      await lenderProfile.save({ session });
      await session.commitTransaction();

      return lenderProfile;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Create a borrower profile for a role
   * @param {string} roleId - The borrower role ID
   * @param {Object} profileData - The borrower profile data
   * @returns {Promise<Object>} - The created borrower profile
   */
  static async createBorrowerProfile(roleId, profileData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate that the role exists and is a BORROWER type
      const role = await Role.findById(roleId).session(session);
      if (!role) {
        throw new Error("Role not found");
      }

      if (role.name !== ROLE_TYPES.BORROWER) {
        throw new Error("Invalid role type. Must be a BORROWER role.");
      }

      // Check if profile already exists
      const existingProfile = await BorrowerProfile.findOne({ roleId }).session(
        session
      );
      if (existingProfile) {
        throw new Error("Borrower profile already exists for this role");
      }

      // Create borrower profile
      const borrowerProfile = new BorrowerProfile({
        roleId,
        ...profileData,
      });

      await borrowerProfile.save({ session });
      await session.commitTransaction();

      return borrowerProfile;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get all users with a specific role
   * @param {string} roleName - The role name (from ROLE_TYPES)
   * @returns {Promise<Array>} - Users with the specified role
   */
  static async getUsersByRole(roleName) {
    // Find role
    const role = await Role.findOne({ name: roleName }).populate("users");
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    return role.users;
  }

  /**
   * Get a user's complete profile including role and type-specific profiles
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - User's complete profile
   */
  static async getUserCompleteProfile(userId) {
    // Get user basic info
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find all roles assigned to this user
    const roles = await Role.find({ users: userId });

    // Initialize result object
    const result = {
      user,
      roles,
    };

    // Check for lender profile
    const lenderRole = roles.find((role) => role.name === ROLE_TYPES.LENDER);
    if (lenderRole) {
      const lenderProfile = await LenderProfile.findOne({
        roleId: lenderRole._id,
      });
      if (lenderProfile) {
        result.lenderProfile = lenderProfile;
      }
    }

    // Check for borrower profile
    const borrowerRole = roles.find(
      (role) => role.name === ROLE_TYPES.BORROWER
    );
    if (borrowerRole) {
      const borrowerProfile = await BorrowerProfile.findOne({
        roleId: borrowerRole._id,
      });
      if (borrowerProfile) {
        result.borrowerProfile = borrowerProfile;
      }
    }

    return result;
  }

  /**
   * Remove a user from a role
   * @param {string} userId - The user ID
   * @param {string} roleName - The role name (from ROLE_TYPES)
   * @returns {Promise<Object>} - The updated role
   */
  static async removeUserFromRole(userId, roleName) {
    // Find role
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    // Remove user from role's users array
    role.users = role.users.filter((id) => id.toString() !== userId);
    await role.save();

    return role;
  }
}

export default RoleUserService;
