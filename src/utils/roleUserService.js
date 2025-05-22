// src/utils/roleUserService.js
import User from "../models/User.js";
import { Role, ROLE_TYPES } from "../models/Role.js";
import BorrowerProfile from "../models/BorrowerProfile.js";
import LenderProfile from "../models/LenderProfile.js";
import { ApiError } from "../helpers/ApiError.js";

class RoleUserService {
  /**
   * Get complete user profile with role-specific data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Complete user profile
   */
  static async getUserCompleteProfile(userId) {
    try {
      // Get basic user information
      const user = await User.findById(userId).select(
        "-password -refreshToken"
      );
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Get roles assigned to the user
      const roles = await Role.find({ users: userId });
      if (!roles || roles.length === 0) {
        return { user, roles: [] };
      }

      // Extract role names
      const roleNames = roles.map((role) => role.name);

      // Create profile object
      const profile = { user, roles: roleNames };

      // Get role-specific profiles if they exist
      if (roleNames.includes(ROLE_TYPES.BORROWER)) {
        const borrowerRole = roles.find((r) => r.name === ROLE_TYPES.BORROWER);
        const borrowerProfile = await BorrowerProfile.findOne({
          roleId: borrowerRole._id,
        });
        if (borrowerProfile) {
          profile.borrowerProfile = borrowerProfile;
        }
      }

      if (roleNames.includes(ROLE_TYPES.LENDER)) {
        const lenderRole = roles.find((r) => r.name === ROLE_TYPES.LENDER);
        const lenderProfile = await LenderProfile.findOne({
          roleId: lenderRole._id,
        });
        if (lenderProfile) {
          profile.lenderProfile = lenderProfile;
        }
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assign a role to a user and create role-specific profile
   * @param {string} userId - User ID
   * @param {string} roleName - Role name from ROLE_TYPES
   * @param {Object} profileData - Profile data for the role
   * @returns {Promise<Object>} Created role and profile
   */
  static async assignRoleToUser(userId, roleName, profileData = {}) {
    try {
      // Validate role name
      if (!Object.values(ROLE_TYPES).includes(roleName)) {
        throw new ApiError(400, "Invalid role type");
      }

      // Get or create the role
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        // Create the role if it doesn't exist
        role = await Role.create({
          name: roleName,
          description: `${
            roleName.charAt(0).toUpperCase() + roleName.slice(1)
          } role`,
        });
      }

      // Check if user already has this role
      if (role.users.includes(userId)) {
        throw new ApiError(400, `User already has the ${roleName} role`);
      }

      // Add user to role
      role.users.push(userId);
      await role.save();

      let roleProfile = null;

      // Create role-specific profile based on role type
      if (
        roleName === ROLE_TYPES.BORROWER &&
        Object.keys(profileData).length > 0
      ) {
        roleProfile = await BorrowerProfile.create({
          roleId: role._id,
          ...profileData,
        });
      } else if (
        roleName === ROLE_TYPES.LENDER &&
        Object.keys(profileData).length > 0
      ) {
        roleProfile = await LenderProfile.create({
          roleId: role._id,
          ...profileData,
        });
      }

      return { role, profile: roleProfile };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register a new user with role and profile
   * @param {Object} userData - Basic user data (name, email, password)
   * @param {string} roleName - Role name from ROLE_TYPES
   * @param {Object} profileData - Profile data for the role
   * @returns {Promise<Object>} Created user with role and profile
   */
  static async registerUserWithRole(userData, roleName, profileData = {}) {
    try {
      // Create the user
      const user = await User.create(userData);

      if (!user.accountNumber) {
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
        user.accountNumber = `ACC${randomDigits}`;
        console.log(user.accountNumber);
      }

      // Assign default USER role
      await this.assignRoleToUser(user._id, ROLE_TYPES.USER);

      // If additional role is specified, assign that as well
      if (roleName && roleName !== ROLE_TYPES.USER) {
        await this.assignRoleToUser(user._id, roleName, profileData);
      }

      return user;
    } catch (error) {
      // If there was an error, try to delete the partially created user
      if (error.code !== 11000) {
        // Not a duplicate key error
        const user = await User.findOne({ email: userData.email });
        if (user) {
          await User.deleteOne({ _id: user._id });
        }
      }
      throw error;
    }
  }

  /**
   * Remove a role from a user and delete the associated profile
   * @param {string} userId - User ID
   * @param {string} roleName - Role name from ROLE_TYPES
   * @returns {Promise<boolean>} Success status
   */
  static async removeRoleFromUser(userId, roleName) {
    try {
      // Find the role
      const role = await Role.findOne({ name: roleName });
      if (!role) {
        throw new ApiError(404, "Role not found");
      }

      // Check if user has this role
      if (!role.users.includes(userId)) {
        throw new ApiError(400, `User does not have the ${roleName} role`);
      }

      // Remove user from role
      role.users = role.users.filter(
        (id) => id.toString() !== userId.toString()
      );
      await role.save();

      // Delete role-specific profile
      if (roleName === ROLE_TYPES.BORROWER) {
        await BorrowerProfile.deleteOne({ roleId: role._id });
      } else if (roleName === ROLE_TYPES.LENDER) {
        await LenderProfile.deleteOne({ roleId: role._id });
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default RoleUserService;
