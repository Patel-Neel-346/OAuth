// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import User from "./models/User.js";
// import { Role, ROLE_TYPES } from "./models/Role.js";
// import LenderProfile from "./models/LenderProfile.js";
// import BorrowerProfile from "./models/BorrowerProfile.js";
// import RoleUserService from "./utils/roleUserService.js";

// // Load environment variables
// dotenv.config();

// // Connect to MongoDB
// mongoose
//   .connect(`mongodb://localhost:27017/Bank`)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// async function runExample() {
//   try {
//     // Clear existing data for demo
//     await User.deleteMany({});
//     await Role.deleteMany({});
//     await LenderProfile.deleteMany({});
//     await BorrowerProfile.deleteMany({});

//     console.log("Creating roles...");

//     // Create roles
//     const userRole = await Role.create({
//       name: ROLE_TYPES.USER,
//       description: "Regular user with basic privileges",
//       permissions: ["view_own_profile", "update_own_profile"],
//     });

//     const lenderRole = await Role.create({
//       name: ROLE_TYPES.LENDER,
//       description: "Can provide loans to borrowers",
//       permissions: [
//         "view_own_profile",
//         "update_own_profile",
//         "create_loan_offers",
//       ],
//     });

//     const borrowerRole = await Role.create({
//       name: ROLE_TYPES.BORROWER,
//       description: "Can request loans from lenders",
//       permissions: ["view_own_profile", "update_own_profile", "request_loans"],
//     });

//     console.log("Creating users...");

//     // Create users
//     const user1 = await User.create({
//       name: "John Doe",
//       email: "john@example.com",
//       password: "password123",
//       contactInfo: {
//         phone: "123-456-7890",
//         alternateEmail: "johndoe@personal.com",
//       },
//       dateOfBirth: new Date("1985-05-15"),
//     });

//     const user2 = await User.create({
//       name: "Jane Smith",
//       email: "jane@example.com",
//       password: "password456",
//       contactInfo: {
//         phone: "555-123-4567",
//         alternateEmail: "janesmith@personal.com",
//       },
//       dateOfBirth: new Date("1990-08-22"),
//     });

//     console.log("Assigning roles to users...");

//     // Assign roles to users
//     await RoleUserService.assignRoleToUser(user1._id, ROLE_TYPES.LENDER);
//     await RoleUserService.assignRoleToUser(user2._id, ROLE_TYPES.BORROWER);

//     console.log("Creating lender profile...");

//     // Create lender profile for John (via the role)
//     const lenderProfile = await RoleUserService.createLenderProfile(
//       lenderRole._id,
//       {
//         lendingCapacity: 100000,
//         interestRate: {
//           personal: 5.5,
//           business: 7.2,
//           home: 3.8,
//         },
//         availableFunds: 75000,
//       }
//     );

//     console.log("Creating borrower profile...");

//     // Create borrower profile for Jane (via the role)
//     const borrowerProfile = await RoleUserService.createBorrowerProfile(
//       borrowerRole._id,
//       {
//         creditScore: 720,
//         totalDebt: 15000,
//         monthlyIncome: 5500,
//         employmentStatus: "employed",
//         employmentDuration: 36, // 3 years
//       }
//     );

//     console.log("Retrieving users by role...");

//     // Get all lenders
//     const lenders = await RoleUserService.getUsersByRole(ROLE_TYPES.LENDER);
//     console.log(
//       `Found ${lenders.length} lenders:`,
//       lenders.map((u) => u.name)
//     );

//     // Get all borrowers
//     const borrowers = await RoleUserService.getUsersByRole(ROLE_TYPES.BORROWER);
//     console.log(
//       `Found ${borrowers.length} borrowers:`,
//       borrowers.map((u) => u.name)
//     );

//     console.log("Retrieving complete user profile...");

//     // Get John's complete profile
//     const johnProfile = await RoleUserService.getUserCompleteProfile(user1._id);
//     console.log("John's profile:");
//     console.log(`- Name: ${johnProfile.user.name}`);
//     console.log(`- Roles: ${johnProfile.roles.map((r) => r.name).join(", ")}`);
//     if (johnProfile.lenderProfile) {
//       console.log(
//         `- Lending capacity: $${johnProfile.lenderProfile.lendingCapacity}`
//       );
//       console.log(
//         `- Personal loan rate: ${johnProfile.lenderProfile.interestRate.personal}%`
//       );
//     }

//     // Get Jane's complete profile
//     const janeProfile = await RoleUserService.getUserCompleteProfile(user2._id);
//     console.log("Jane's profile:");
//     console.log(`- Name: ${janeProfile.user.name}`);
//     console.log(`- Roles: ${janeProfile.roles.map((r) => r.name).join(", ")}`);
//     if (janeProfile.borrowerProfile) {
//       console.log(`- Credit score: ${janeProfile.borrowerProfile.creditScore}`);
//       console.log(
//         `- Monthly income: $${janeProfile.borrowerProfile.monthlyIncome}`
//       );
//       console.log(
//         `- Debt-to-income ratio: ${janeProfile.borrowerProfile.debtToIncomeRatio}`
//       );
//     }

//     console.log("Example completed successfully!");
//   } catch (error) {
//     console.error("Error running example:", error);
//   } finally {
//     // Close the database connection
//     mongoose.disconnect();
//     console.log("MongoDB disconnected");
//   }
// }

// // Run the example
// runExample();
