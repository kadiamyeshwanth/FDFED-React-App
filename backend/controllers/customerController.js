const { Customer, Worker, ArchitectHiring, DesignRequest, ConstructionProjectSchema, Bid, Company, FavoriteDesign } = require('../models/index');
const { getTargetDate } = require('../utils/helpers');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { findOrCreateChatRoom } = require('./chatController'); // NEW: Import the chat utility

const getDashboard = (req, res) => res.render('customer/customer_dashboard');

const getJobRequestStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) return res.status(401).send('Unauthorized');
    
    // Fetch raw applications
    const rawArchitectApplications = await ArchitectHiring.find({ customer: req.user.user_id }).lean();
    const rawInteriorApplications = await DesignRequest.find({ customerId: req.user.user_id }).lean();
    const companyApplications = await ConstructionProjectSchema.find({ customerId: req.user.user_id }).lean();

    // NEW: Map applications to include chat room information
    const architectApplications = await Promise.all(rawArchitectApplications.map(async (app) => {
        if (app.status === 'Accepted' && app.worker) { // Check status and worker assignment
            const chatRoom = await findOrCreateChatRoom(app._id, 'architect');
            return { ...app, chatId: chatRoom ? chatRoom.roomId : null };
        }
        return app;
    }));

    const interiorApplications = await Promise.all(rawInteriorApplications.map(async (app) => {
        if (app.status === 'accepted' && app.workerId) { // Check status and worker assignment
            const chatRoom = await findOrCreateChatRoom(app._id, 'interior');
            return { ...app, chatId: chatRoom ? chatRoom.roomId : null };
        }
        return app;
    }));

    res.render('customer/Job_Status', { architectApplications, interiorApplications, companyApplications });
  } catch (error) {
    console.error('Error fetching job request status:', error);
    res.status(500).send('Internal Server Error');
  }
};

const getConstructionCompaniesList = async (req, res) => {
  try {
    const companies = await Company.find({}).lean();
    res.render('customer/construction_companies_list', { companies, user: req.user });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).send('Server error');
  }
};

const getArchitects = async (req, res) => {
  try {
    const architects = await Worker.find({ isArchitect: true }).lean();
    res.render('customer/architect', { architects });
  } catch (error) {
    console.error('Error fetching architects:', error);
    res.status(500).json({ message: 'Failed to fetch architects' });
  }
};

const getArchitectForm = (req, res) => {
  const { workerId } = req.query;
  res.render('customer/architect_form', { workerId });
};

// // Function to generate a target date (You must define this function)
// const getTargetDate = (createdAt, projectTimeline) => {
//     // This is a placeholder. You need a proper date calculation logic.
//     // Assuming projectTimeline is in months.
//     if (!createdAt || !projectTimeline) {
//         return 'TBD';
//     }
//     const date = new Date(createdAt);
//     date.setMonth(date.getMonth() + projectTimeline);
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
// };

const getOngoingProjects = async (req, res) => {
    try {
        const customerId = req.user.user_id;
        if (!customerId) return res.redirect("/login");

        const projects = await ConstructionProjectSchema.find({
            customerId,
            status: "accepted",
        })
            .populate("companyId", "companyName") // Populate company name
            .lean();

        const totalActiveProjects = projects.length;
        const metrics = {
            totalActiveProjects,
            monthlyRevenue: "4.8",
            customerSatisfaction: "4.7",
            projectsOnSchedule: "85",
        };

        const enhancedProjects = projects.map((project) => {
            // Calculate completion percentage based on current phase
            let completion = 0;
            let currentPhase = "Planning";

            if (project.currentPhase) {
                const phases = [
                    "Foundation",
                    "Structure",
                    "Interior work",
                    "Finishing",
                ];
                const phaseIndex = phases.indexOf(project.currentPhase);
                completion = phaseIndex >= 0 ? (phaseIndex + 1) * 25 : 0;
                currentPhase = project.currentPhase;
            }

            // Use completionPercentage if available, otherwise calculate
            completion = project.completionPercentage || completion;

            // Format target date
            let targetDate = "Not specified";
            if (project.targetCompletionDate) {
                targetDate = new Date(
                    project.targetCompletionDate
                ).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); // Formatting for readability
            } else if (project.projectTimeline && project.createdAt) {
                targetDate = getTargetDate(project.createdAt, project.projectTimeline);
            }

            return {
                ...project,
                completion: completion,
                targetDate: targetDate,
                currentPhase: currentPhase,
                // Map recentUpdates to the structure the EJS expects (update.image, update.description)
                updates: (project.recentUpdates || []).map(update => ({
                    description: update.updateText || 'No description',
                    image: update.updateImagePath || '/images/update-default.jpg',
                })),
                siteFilepaths: project.siteFilepaths || (project.mainImagePath ? [project.mainImagePath] : []),
                floors: project.floors || [],
                // Ensure all fields have proper fallbacks
                specialRequirements: project.specialRequirements || "None specified",
                accessibilityNeeds: project.accessibilityNeeds || "none",
                energyEfficiency: project.energyEfficiency || "standard",
                companyName: project.companyId
                    ? project.companyId.companyName
                    : "Not assigned",
            };
        });

        res.render("customer/ongoing_projects", {
            projects: enhancedProjects,
            metrics,
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).send("Server error");
    }
};

const getDesignIdeas = (req, res) => res.render('customer/design_ideas');

const getInteriorDesignForm = (req, res) => {
  const { workerId } = req.query;
  res.render('customer/interiordesign_form', { workerId });
};

const getInteriorDesigners = async (req, res) => {
  try {
    const designers = await Worker.find({ isArchitect: false }).lean();
    res.render('customer/interior_design', { designers });
  } catch (error) {
    console.error('Error fetching designers:', error);
    res.status(500).json({ message: 'Failed to fetch designers' });
  }
};

const getConstructionForm = (req, res) => res.render('customer/construction_form');

const getBidForm = (req, res) => res.render('customer/bid_form');

const submitBidForm = async (req, res) => {
  // Files are available in req.files due to multer middleware
  const siteFiles = req.files.siteFiles || [];
  const floorImages = req.files.floorImages || [];

  // Map file arrays to their paths for saving in the database
  const siteFilepaths = siteFiles.map((file) => file.path);
  // Floor images will be matched to their respective floor later

  const {
    projectName,
    customerName,
    customerEmail,
    customerPhone,
    projectAddress,
    projectLocation, // Corresponds to projectLocation Pincode in the form
    totalArea,
    buildingType,
    estimatedBudget,
    projectTimeline,
    totalFloors,
    specialRequirements,
    accessibilityNeeds,
    energyEfficiency,
    floors, // This will be an array of objects if names are correct (floors[i][prop])
  } = req.body;

  try {
    if (!req.user || !req.user.user_id) {
      // Handle case where auth failed but form submitted
      return res
        .status(401)
        .send("Authentication required to submit a bid request.");
    }

    let parsedFloors = floors || [];

    // When using 'floors[i][prop]' naming convention with Multer,
    // the 'floors' variable in req.body might be an array-like object or a regular array.
    // We need to ensure it's properly structured, and map image files to the correct floor.
    if (!Array.isArray(parsedFloors)) {
      // Flatten the array-like structure into a clean array
      parsedFloors = Object.values(parsedFloors);
    }

    // Map floor images to the corresponding floor based on their order of appearance
    const finalFloors = parsedFloors.map((floor, index) => {
      return {
        ...floor,
        floorArea: Number(floor.floorArea), // Ensure numbers are stored as Number
        floorNumber: Number(floor.floorNumber),
        // Map the image path, assuming floorImages array maintains the order of floor submissions
        floorImagePath: floorImages[index] ? floorImages[index].path : null,
      };
    });

    // Create new Bid document
    const newBid = new Bid({
      projectName,
      customerId: req.user.user_id, // Get customer ID from authenticated user
      customerName,
      customerEmail,
      customerPhone,
      projectAddress,
      projectLocation, // Using the Pincode field for projectLocation
      totalArea: Number(totalArea),
      buildingType,
      estimatedBudget: Number(estimatedBudget) || 0,
      projectTimeline: Number(projectTimeline) || 0,
      totalFloors: Number(totalFloors),
      floors: finalFloors,
      specialRequirements,
      accessibilityNeeds,
      energyEfficiency,
      siteFiles: siteFilepaths, // Save the paths of the site files
      status: "open", // Default status as per the model
      companyBids: [], // Start with an empty array of company bids
    });

    await newBid.save();

    // // Redirect to a success page or the job status page
    // req.flash(
    //   "success",
    //   "Your project request has been submitted successfully!"
    // );
    res.redirect("/job_status");
  } catch (error) {
    console.error("Error in submitBidForm:", error);
    // Handle MongoDB validation errors or other server errors
    res
      .status(500)
      .send(
        "Error submitting project request. Please check the fields and try again."
      );
  }
};

const getSettings = async (req, res) => {
  try {
    const user = await Customer.findById(req.user.user_id).lean();
    res.render('customer/customer_settings', { user });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).send('Server error');
  }
};

const getBidSpace = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const customerBids = await Bid.find({ customerId }).lean();
    res.render('customer/bid_space', { customerBids, user: req.user });
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).send('Server error');
  }
};

const postConstructionForm = async (req, res) => {
  try {
    const {
      projectName,
      customerName,
      customerEmail,
      customerPhone,
      projectAddress,
      projectLocationPincode,
      totalArea,
      buildingType,
      estimatedBudget,
      projectTimeline,
      totalFloors,
      specialRequirements,
      accessibilityNeeds,
      energyEfficiency,
      floors
    } = req.body;

    const siteFilepaths = req.files ? req.files.map(file => file.path) : [];

    let parsedFloors = [];
    if (typeof floors === 'string') {
      try {
        parsedFloors = JSON.parse(floors);
      } catch (e) {
        console.error('Error parsing floors:', e);
        return res.status(400).send('Invalid floors data');
      }
    } else if (Array.isArray(floors)) {
      parsedFloors = floors;
    }

    const newProject = new ConstructionProjectSchema({
      projectName,
      customerName,
      customerEmail,
      customerPhone,
      projectAddress,
      projectLocationPincode,
      totalArea: Number(totalArea),
      buildingType,
      estimatedBudget: Number(estimatedBudget) || 0,
      projectTimeline: Number(projectTimeline) || 0,
      totalFloors: Number(totalFloors),
      floors: parsedFloors,
      specialRequirements,
      accessibilityNeeds,
      energyEfficiency,
      siteFilepaths,
      customerId: req.user ? req.user.user_id : null,
      status: 'pending'
    });

    await newProject.save();
    res.redirect('/ongoing_projects');
  } catch (error) {
    console.error('Error in postConstructionForm:', error);
    res.status(500).send('Server Error');
  }
};


// ====================================================================
// CORRECTED FAVORITES API CONTROLLERS (Using Array Operations)
// ====================================================================

/**
 * GET /api/customer/favorites
 * Fetches all favorited designs for the logged-in customer.
 */
const getFavorites = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const customerId = req.user.user_id;

        // Find the single favorites document for the customer
        const favoritesDoc = await FavoriteDesign.findOne({ customerId }).lean();

        // If the document exists, return the designs array, otherwise return an empty array
        const favorites = favoritesDoc ? favoritesDoc.designs : [];

        // The front-end code expects the 'favorites' key in the response
        res.status(200).json({ favorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Failed to retrieve favorites.' });
    }
};

/**
 * POST /api/customer/favorites
 * Adds a new design to the customer's favorites array.
 */
const saveFavoriteDesign = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const customerId = req.user.user_id;
        const { designId, category, title, imageUrl } = req.body;

        if (!designId || !category || !title || !imageUrl) {
            return res.status(400).json({ message: 'Missing required design fields.' });
        }

        // The new design object to be added to the array
        const newDesign = { designId, category, title, imageUrl };

        // Find and update: Use $addToSet to add the design only if designId doesn't exist
        // upsert: true means if the document doesn't exist, create it.
        const updatedDoc = await FavoriteDesign.findOneAndUpdate(
            { customerId },
            { $addToSet: { designs: newDesign } },
            { new: true, upsert: true }
        );

        if (!updatedDoc) {
             return res.status(500).json({ message: 'Failed to create or update favorites document.' });
        }

        // Return the successfully added item (the last one in the array)
        const addedDesign = updatedDoc.designs.find(d => d.designId === designId);

        res.status(201).json({ 
            message: 'Design added to favorites!', 
            // The front-end needs the design details back, including a unique ID for removal. 
            // Since Mongoose arrays don't get custom IDs, we use designId for client-side tracking.
            favorite: { ...addedDesign.toObject(), _id: addedDesign.designId } 
        });

    } catch (error) {
        console.error('Error saving favorite design:', error);
        res.status(500).json({ message: 'Failed to save favorite due to a server error.' });
    }
};

/**
 * DELETE /api/customer/favorites/:id
 * Removes a favorite design using the designId (which the front-end now uses as _id).
 */
const removeFavoriteDesign = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const customerId = req.user.user_id;
        const designIdToRemove = req.params.id; // This is the designId, e.g., "LivingRoom-1"

        // Use $pull to remove the object from the 'designs' array based on its designId
        const result = await FavoriteDesign.updateOne(
            { customerId },
            { $pull: { designs: { designId: designIdToRemove } } }
        );

        if (result.modifiedCount === 0 && result.matchedCount === 0) {
            return res.status(404).json({ message: 'Favorite list not found or design not in favorites.' });
        }
        
        // Ensure the deletion was successful
        if (result.modifiedCount === 0 && result.matchedCount === 1) {
            // This happens if the designId was not found in the array
            return res.status(404).json({ message: 'Design not found in favorites array.' });
        }

        res.status(200).json({ message: 'Favorite design removed successfully.' });
    } catch (error) {
        console.error('Error removing favorite design:', error);
        res.status(500).json({ message: 'Failed to remove favorite.' });
    }
};
const acceptProposal = async (req, res) => {
    try {
        const { type, id } = req.params;
        const customerId = req.user.user_id;

        let project;

        if (type === 'architect') {
            project = await ArchitectHiring.findOne({ _id: id, customer: customerId });
            if (!project) return res.status(404).send('Project not found or you are not authorized.');
            
            // --- FIX: Save the final amount ---
            if (project.proposal && project.proposal.price) {
                project.finalAmount = project.proposal.price;
            }
            project.status = 'Accepted';

        } else if (type === 'interior') {
            const projectToUpdate = await DesignRequest.findOne({ _id: id, customerId: customerId });
            if (!projectToUpdate) {
                 return res.status(404).send('Project not found or you are not authorized.');
            }
            project = projectToUpdate;

            // --- FIX: Save the final amount ---
            if (project.proposal && project.proposal.price) {
                project.finalAmount = project.proposal.price;
            }
            project.status = 'accepted';

        } else {
            return res.status(400).send('Invalid project type.');
        }

        await project.save();
        
        res.redirect('/job_status');

    } catch (error) {
        console.error('Error accepting proposal:', error);
        res.status(500).send('Server Error');
    }
};
const acceptCompanyBid = async (req, res) => {
    try {
        const { bidId, companyBidId } = req.params;
        const customerId = req.user.user_id;

        // Find the bid and ensure it belongs to the logged-in customer
        const bid = await Bid.findOne({ _id: bidId, customerId: customerId });
        if (!bid) {
            return res.status(404).send('Bid not found or you are not authorized.');
        }

        // Find the specific company's bid within the main bid document
        const companyBid = bid.companyBids.id(companyBidId);
        if (!companyBid) {
            return res.status(404).send('Company bid not found.');
        }

        // --- THIS IS WHERE THE PAYMENT LOGIC STARTS ---

        // In a real application, you would now create a Stripe Checkout session.
        // For now, we will simulate a successful payment by updating the status directly.

        // 1. Update the main bid status
        bid.status = 'awarded';
        bid.winningBidId = companyBidId;

        // 2. Populate the paymentDetails object
        const platformFeePercentage = 0.05; // 5% commission
        bid.paymentDetails.totalAmount = companyBid.bidPrice;
        bid.paymentDetails.platformFee = companyBid.bidPrice * platformFeePercentage;
        bid.paymentDetails.paymentStatus = 'paid'; // Mark as paid since we are simulating

        // 3. Set up the initial 20% payout for the company
        const advancePayout = companyBid.bidPrice * 0.20;
        bid.paymentDetails.payouts.push({
            amount: advancePayout,
            status: 'pending' // This would be 'released' after a real payment
        });

        //Update the data into the construction project schemas

        await UpdateOngoingProjectsSchema(bid, companyBid);
        await bid.save();

        // Redirect the customer to their ongoing projects page
        res.redirect('/ongoing_projects');

    } catch (error) {
        console.error('Error accepting company bid:', error);
        res.status(500).send('Server Error');
    }
};

const UpdateOngoingProjectsSchema = async (bid, companyBid) => {
  // Determine the project's initial status
  const initialStatus = "accepted";

  // The ConstructionProjectSchema document uses the data from the accepted bid.
  await ConstructionProjectSchema.create({
    // --- REQUIRED FIELDS (MANDATORY for Mongoose to pass validation) ---
    projectName: bid.projectName,
    customerId: bid.customerId,
    companyId: companyBid.companyId, // From companyBid
    customerName: bid.customerName,
    customerEmail: bid.customerEmail,
    customerPhone: bid.customerPhone,
    projectAddress: bid.projectAddress,
    totalArea: bid.totalArea,
    buildingType: bid.buildingType,
    totalFloors: bid.totalFloors,

    // --- Mapped from Bid (Optional/Complex Fields) ---
    projectLocationPincode: bid.projectLocation, // Map to Pincode field
    estimatedBudget: bid.estimatedBudget, // From bid
    projectTimeline: bid.projectTimeline, // From bid
    floors: bid.floors, // Array of sub-documents
    specialRequirements: bid.specialRequirements,
    accessibilityNeeds: bid.accessibilityNeeds,
    energyEfficiency: bid.energyEfficiency,
    siteFilepaths: bid.siteFiles, // Mapped from 'siteFiles' to 'siteFilepaths'

    // --- Initial Project Status and Completion ---
    status: initialStatus,
    completionPercentage: 0,
    additionalImagePaths: [],
    recentUpdates: [],

    // --- Proposal Details (Using the winning company bid) ---
    // This object is likely REQUIRED by the business logic, if not schema definition.
    proposal: {
      price: companyBid.bidPrice,
      description: "Accepted Bid Price of " + companyBid.bidPrice,
      sentAt: companyBid.bidDate,
    },

    // --- Payment Details (Using the pre-calculated data from the updated bid) ---
    // Since we moved the call later, we use the fully populated bid.paymentDetails
    paymentDetails: {
      totalAmount: bid.paymentDetails.totalAmount,
      platformFee: bid.paymentDetails.platformFee,
      amountPaidToCompany: bid.paymentDetails.amountPaidToCompany, // Should be 0 initially
      paymentStatus: bid.paymentDetails.paymentStatus, // Should be 'paid' (simulated)
      payouts: bid.paymentDetails.payouts, // Initial payout included
    },
  });
};

const acceptCompanyProposal = async (req, res) => {
  try {
    const { projectId } = req.params;
    const customerId = req.user.user_id;

    const project = await ConstructionProjectSchema.findOne({ _id: projectId, customerId: customerId });
    if (!project || project.status !== 'proposal_sent') {
        return res.status(404).send('Project not found or proposal not available.');
    }

    // --- PAYMENT LOGIC WOULD GO HERE ---
    // For now, we simulate a successful payment

    project.status = 'accepted';
    
    const platformFeePercentage = 0.05; // 5% commission
    project.paymentDetails.totalAmount = project.proposal.price;
    project.paymentDetails.platformFee = project.proposal.price * platformFeePercentage;
    project.paymentDetails.paymentStatus = 'paid';

    const advancePayout = project.proposal.price * 0.20; // 20% advance
    project.paymentDetails.payouts.push({
        amount: advancePayout,
        status: 'pending'
    });

    await project.save();
    res.redirect('/ongoing_projects');

  } catch (error) {
    console.error('Error accepting company proposal:', error);
    res.status(500).send('Server Error');
  }
};
const updatePassword = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required.' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // Compare the provided current password with the one in the database
    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    // Set the new password. The pre-save hook in your schema will automatically hash it.
    customer.password = newPassword;
    await customer.save();

    res.status(200).json({ message: 'Password updated successfully.' });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error while updating password.' });
  }
};
// ====================================================================

module.exports = {
  submitBidForm,
  getDashboard,
  getJobRequestStatus,
  getConstructionCompaniesList,
  getArchitects,
  getArchitectForm,
  getOngoingProjects,
  getDesignIdeas,
  getInteriorDesignForm,
  getInteriorDesigners,
  getConstructionForm,
  getBidForm,
  getSettings,
  getBidSpace,
  postConstructionForm,
  // EXPORT NEW FAVORITES FUNCTIONS
  getFavorites,
  saveFavoriteDesign,
  removeFavoriteDesign,
  acceptProposal,
  acceptCompanyBid,
  acceptCompanyProposal,updatePassword
};
