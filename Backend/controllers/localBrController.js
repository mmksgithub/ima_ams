import asyncHandler from "express-async-handler";
import LocalBranch from "../models/localBrModel.js";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import statebranch from "../models/stateBrModel.js";
// import statebranch from "../models/stateBrModel";

// Controller to add a local branch
// const addLocalBranch = async (req, res) => {
//   try {
//     const {
//       localuserId,
//       localbranchName,
//       localbranchCode,
//       email,
//       password,
//       phone,
//     } = req.body;

//     // Check if all required fields are provided
//     if (
//       !localuserId ||
//       !localbranchName ||
//       !localbranchCode ||
//       !email ||
//       !password
//     ) {
//       return res.status(400).json({ error: "All fields are required." });
//     }

//     // Check if the local branch already exists by localbranchCode or email
//     const localBranchExists = await LocalBranch.findOne({
//       $or: [{ localbranchCode }, { email }],
//     });

//     if (localBranchExists) {
//       return res.status(400).json({
//         error:
//           "Local branch with this local branch code or email already exists.",
//       });
//     }

//     // Hash password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new local branch
//     const newLocalBranch = new LocalBranch({
//       localuserId,
//       localbranchName,
//       localbranchCode,
//       email,
//       password: hashedPassword,
//       phone,
//     });

//     // Save the new local branch
//     await newLocalBranch.save();

//     // Return the response
//     res.status(201).json({
//       message: "Local Branch added successfully.",
//       localBranch: {
//         localuserId: newLocalBranch.localuserId,
//         localbranchName: newLocalBranch.localbranchName,
//         localbranchCode: newLocalBranch.localbranchCode,
//         email: newLocalBranch.email,
//         phone: newLocalBranch.phone,
//       },
//     });
//   } catch (error) {
//     console.error("Error adding local branch:", error);
//     res.status(500).json({ error: "Internal Server Error." });
//   }
// };

// import statebranch from "../models/statebranch"; // Import the statebranch model

const addLocalBranch = async (req, res) => {
  try {
    console.log("local controller add local", req.body);
    const {
      localuserId,
      localbranchName,
      localbranchCode, // Getting localbranchCode from the frontend
      email,
      password,
      phone,
      stateBranch, // Added stateBranch to associate with state
    } = req.body;

    // Check if all required fields are provided
    if (
      !localuserId ||
      !localbranchName ||
      !localbranchCode || // No need to calculate it, use the one from frontend
      !email ||
      !password ||
      !stateBranch // Make sure stateBranchId is provided
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the local branch already exists by email
    const localBranchExists = await LocalBranch.findOne({ email });

    if (localBranchExists) {
      return res.status(400).json({
        error: `Local branch with this ${email} already exists.`,
      });
    }

    // Find the state branch to associate the local branch with
    const stateBranchexists = await statebranch.findById(stateBranch);
    if (!stateBranchexists) {
      return res.status(400).json({ error: "State branch not found." });
    }

    // Ensure localbranches is initialized as an empty array if undefined
    if (!stateBranchexists.localbranches) {
      stateBranchexists.localbranches = []; // Initialize as an empty array if not already set
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new local branch
    const newLocalBranch = new LocalBranch({
      localuserId,
      localbranchName,
      localbranchCode, // Use the localbranchCode passed from the frontend
      email,
      password: hashedPassword,
      phone,
      stateBranch, // Associate the local branch with the state branch
    });

    // Save the new local branch
    await newLocalBranch.save();

    // Update the state branch by adding this new local branch's ID
    stateBranchexists.localbranches.push(newLocalBranch._id);
    await stateBranchexists.save();

    // Return the response
    res.status(201).json({ message: "Local Branch added successfully." });
  } catch (error) {
    console.error("Error adding local branch:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

// Controller to login a local branch
const loginLocalBranch = async (req, res) => {
  try {
    const { localuserId, password } = req.body;

    // Validate the required fields
    if (!localuserId || !password) {
      return res
        .status(400)
        .json({ error: "Please provide both user ID and password." });
    }

    // Check if the local branch exists with the given userId
    const localBranch = await LocalBranch.findOne({ localuserId });
    if (!localBranch) {
      return res
        .status(400)
        .json({ error: "Local branch with this user ID does not exist." });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, localBranch.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { localuserId: localBranch.localuserId, email: localBranch.email },
      process.env.JWT_SECRET, // Use an environment variable for the secret key
      { expiresIn: "1h" }
    );

    // Respond with the token and local branch details
    res.status(200).json({
      message: "Login successful",
      token,
      localBranch: {
        localuserId: localBranch.localuserId,
        localbranchName: localBranch.localbranchName,
        email: localBranch.email,
        phone: localBranch.phone,
      },
    });
  } catch (error) {
    console.error("Error logging in local branch:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

// Controller to update a local branch
const updateLocalBranch = async (req, res) => {
  try {
    const { localuserId } = req.params; // Get the localuserId from URL params
    const updates = req.body; // Get the fields to update from the request body

    // Fields that can't be updated
    const forbiddenFields = ["localuserId", "localbranchName"];

    // Check for forbidden fields in the update request
    for (const field of forbiddenFields) {
      if (updates[field]) {
        return res.status(400).json({ error: `${field} cannot be updated.` });
      }
    }

    // Find the LocalBranch by localuserId
    const localBranch = await LocalBranch.findOne({ localuserId });
    if (!localBranch) {
      return res.status(404).json({ error: "Local branch not found." });
    }

    // Update the fields
    Object.keys(updates).forEach((key) => {
      localBranch[key] = updates[key];
    });

    // Save the updated LocalBranch
    await localBranch.save();

    res.status(200).json({
      message: "Local branch updated successfully.",
      localBranch,
    });
  } catch (error) {
    console.error("Error updating local branch:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

const getLocalBranches = async (req, res) => {
  try {
    // Fetch all local branches from the database
    const localBranches = await LocalBranch.find({
      statebranch: req.user._id,
    }).sort({
      createdAt: -1,
      updatedAt: -1,
    });

    // // If no local branches exist
    // if (localBranches.length === 0) {
    //   return res.status(404).json({ message: "No local branches found." });
    // }

    // Return the list of local branches
    res.status(200).json(localBranches);
  } catch (error) {
    console.error("Error fetching local branches:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

const getAllLocalBranches = asyncHandler(async (req, res) => {
  try {
    // Fetch all local branches and populate the stateBranch field
    const localBranches = await LocalBranch.find()
      .populate("stateBranch", "stateName") // Populate only the 'stateName' field of the stateBranch
      .sort({
        createdAt: -1, // Sort by createdAt descending
        updatedAt: -1, // Sort by updatedAt descending (optional)
      });

    // Return success response with localBranches data
    res.status(200).json(localBranches);
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching local branches:", error);

    // Return a generic error message
    res
      .status(500)
      .json({ message: "An error occurred while fetching local branches." });
  }
});

// Controller to get a single local branch by localuserId
const getLocalBranch = async (req, res) => {
  try {
    const { localuserId } = req.params; // Get the localuserId from URL params

    // Find the local branch with the provided localuserId
    const localBranch = await LocalBranch.findOne({ localuserId });

    // If the local branch doesn't exist
    if (!localBranch) {
      return res.status(404).json({ message: "Local branch not found." });
    }

    // Return the local branch details
    res.status(200).json({
      message: "Local branch details fetched successfully.",
      localBranch,
    });
  } catch (error) {
    console.error("Error fetching local branch:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

const loginStatusLocal = asyncHandler(async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.json(false);
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res.json(false);
  }

  try {
    // Verify token for local branch
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (verified) {
      return res.json(true);
    } else {
      return res.json(false);
    }
  } catch (error) {
    // Handle token verification error
    console.log(
      "Error in backend at loginStatus (Local Branch):",
      error.message
    );
    return res.json(false);
  }
});

export {
  addLocalBranch,
  getLocalBranches,
  getLocalBranch,
  loginLocalBranch,
  updateLocalBranch,
  getAllLocalBranches,
};
