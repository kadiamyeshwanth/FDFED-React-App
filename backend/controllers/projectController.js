const mongoose = require("mongoose");
const {
  ArchitectHiring,
  ConstructionProjectSchema,
  DesignRequest,
  Bid,
  CompanytoWorker,
  WorkerToCompany,
} = require("../models");
const upload = require("../middlewares/upload").upload;

const submitArchitect = async (req, res) => {
  try {
    const customer = req.user.user_id;
    const worker =
      req.body.workerId && req.body.workerId !== ""
        ? new mongoose.Types.ObjectId(req.body.workerId)
        : null;
    const {
      projectName,
      fullName,
      contactNumber,
      email,
      streetAddress,
      city,
      state,
      zipCode,
      plotLocation,
      plotSize,
      plotOrientation,
      designType,
      numFloors,
      floorRequirements,
      specialFeatures,
      architecturalStyle,
      budget,
      completionDate,
    } = req.body;

    let parsedFloorRequirements = [];
    if (floorRequirements) {
      try {
        parsedFloorRequirements =
          typeof floorRequirements === "string"
            ? JSON.parse(floorRequirements)
            : floorRequirements;
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid floorRequirements format" });
      }
    }

    const referenceImages =
      req.files && req.files.length > 0
        ? req.files.map((file) => ({
            url: file.path,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          }))
        : [];

    const architectHiring = new ArchitectHiring({
      projectName,
      status: "Pending",
      customer,
      worker,
      customerDetails: { fullName, contactNumber, email },
      customerAddress: { streetAddress, city, state, zipCode },
      plotInformation: { plotLocation, plotSize, plotOrientation },
      designRequirements: {
        designType,
        numFloors,
        floorRequirements: parsedFloorRequirements.map((floor, index) => ({
          floorNumber: floor.floorNumber || index + 1,
          details: floor.details || "",
        })),
        specialFeatures,
        architecturalStyle,
      },
      additionalDetails: {
        budget,
        completionDate: completionDate ? new Date(completionDate) : undefined,
        referenceImages,
      },
    });

    await architectHiring.save();
    res
      .status(200)
      .json({ message: "Form submitted successfully", redirect: "/architect" });
  } catch (error) {
    console.error("Error in /architect_submit:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to submit design request" });
  }
};

const submitDesignRequest = async (req, res) => {
  try {
    const customer = req.user.user_id;
    const {
      projectName,
      fullName,
      email,
      phone,
      address,
      roomType,
      roomLength,
      roomWidth,
      dimensionUnit,
      ceilingHeight,
      heightUnit,
      designPreference,
      projectDescription,
      workerId,
    } = req.body;
    if (
      !projectName ||
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !roomType ||
      !roomLength ||
      !roomWidth ||
      !dimensionUnit
    )
      return res.status(400).json({ error: "Missing required fields" });

    const currentRoomImages = req.files
      .filter((file) => file.fieldname === "currentRoomImages")
      .map((file) => file.path);
    const inspirationImages = req.files
      .filter((file) => file.fieldname === "inspirationImages")
      .map((file) => file.path);

    const designRequest = new DesignRequest({
      projectName,
      fullName,
      email,
      phone,
      address,
      roomType,
      roomSize: {
        length: parseFloat(roomLength),
        width: parseFloat(roomWidth),
        unit: dimensionUnit,
      },
      ceilingHeight: ceilingHeight
        ? { height: parseFloat(ceilingHeight), unit: heightUnit }
        : undefined,
      designPreference,
      projectDescription,
      currentRoomImages,
      customerId: customer,
      inspirationImages,
      workerId,
    });
    await designRequest.save();
    res
      .status(201)
      .json({
        message: "Design request submitted successfully",
        success: true,
      });
  } catch (error) {
    res.status(500).json({ error: "Server error", success: false });
  }
};

const submitConstructionForm = async (req, res) => {
  try {
    const {
      projectName,
      customerName,
      customerEmail,
      customerPhone,
      projectAddress,
      projectLocation,
      totalArea,
      buildingType,
      estimatedBudget,
      projectTimeline,
      totalFloors,
      specialRequirements,
      accessibilityNeeds,
      energyEfficiency,
      companyId,
    } = req.body;
    const customerId = req.user.user_id;
    const floors = [];
    for (let i = 1; i <= parseInt(totalFloors); i++) {
      const floorType = req.body[`floorType-${i}`];
      const floorArea = req.body[`floorArea-${i}`];
      const floorDescription = req.body[`floorDescription-${i}`];
      const floorImageFile = req.files.find(
        (file) => file.fieldname === `floorImage-${i}`
      );
      const floorImagePath = floorImageFile ? floorImageFile.path : "";
      floors.push({
        floorNumber: i,
        floorType,
        floorArea,
        floorDescription,
        floorImagePath,
      });
    }
    const siteFilepaths = req.files
      .filter((file) => file.fieldname === "siteFiles")
      .map((file) => file.path);
    const newProject = new ConstructionProjectSchema({
      projectName,
      customerName,
      customerEmail,
      customerPhone,
      projectAddress,
      projectLocationPincode: projectLocation,
      totalArea,
      buildingType,
      estimatedBudget,
      projectTimeline,
      totalFloors,
      floors,
      specialRequirements,
      accessibilityNeeds,
      energyEfficiency,
      siteFilepaths,
      companyId,
      customerId,
    });
    await newProject.save();
    res.status(201).json({
      success: true,
      message: "Project submitted successfully",
      projectId: newProject._id,
    });
  } catch (error) {
    console.error("Error submitting project:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting project",
      error: error.message,
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await ConstructionProjectSchema.find({
      status: "pending",
    }).lean();
    // routed file : projects
    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await ConstructionProjectSchema.findById(
      req.params.id
    ).lean();
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

const getEditProject = async (req, res) => {
  try {
    const project = await ConstructionProjectSchema.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    // routed file : company/addnewproject_form
    res.status(200).json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateProject = async (req, res) => {
  try {
    const {
      projectId,
      completionPercentage,
      targetCompletionDate,
      currentPhase,
      updates,
      milestonePercentage,
      milestoneMessage,
    } = req.body;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ message: "Invalid project ID" });
    const project = await ConstructionProjectSchema.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

<<<<<<< Updated upstream
    // Handle milestone updates with validation
    if (milestonePercentage) {
      const milestonePercent = parseInt(milestonePercentage);
=======
    // Determine incoming progress value (support legacy completionPercentage field)
    const incomingProgressRaw = milestonePercentage ?? completionPercentage;
    if (incomingProgressRaw !== undefined && incomingProgressRaw !== null && incomingProgressRaw !== '') {
      const progressValue = parseInt(incomingProgressRaw, 10);
      if (Number.isNaN(progressValue)) {
        return res.status(400).json({ message: "Progress value must be a number." });
      }
      if (progressValue < 0 || progressValue > 100) {
        return res.status(400).json({ message: "Progress must be between 0 and 100." });
      }

>>>>>>> Stashed changes
      const checkpoints = [25, 50, 75, 100];
      const isCheckpoint = checkpoints.includes(milestonePercent);
      
      // Message is required only for checkpoint values
      if (isCheckpoint && !milestoneMessage) {
        return res.status(400).json({ message: `Checkpoint ${milestonePercent}% requires a message for the customer.` });
      }
      
      // Check if milestone is valid
      if (milestonePercent < 0 || milestonePercent > 100) {
        return res.status(400).json({ message: "Invalid milestone percentage. Must be between 0 and 100." });
      }

      // Check for backward progression
      const maxCompletedPercentage = project.completionPercentage || 0;
      
      if (milestonePercent < maxCompletedPercentage) {
        return res.status(400).json({ 
          message: `Cannot move backward. Current progress is at ${maxCompletedPercentage}%. Please select a higher percentage.` 
        });
      }
      
      // Find the last checkpoint that needs approval
      const lastApprovedCheckpoint = checkpoints.reduce((lastApproved, checkpoint) => {
        const checkpointMilestone = project.milestones.find(
          m => m.percentage === checkpoint && m.isCheckpoint
        );
        if (checkpointMilestone && checkpointMilestone.isApprovedByCustomer) {
          return checkpoint;
        }
        return lastApproved;
      }, 0);

      // Find next checkpoint that needs approval
      const nextCheckpoint = checkpoints.find(c => c > lastApprovedCheckpoint) || 100;

      // Check if trying to cross a checkpoint without approval
      if (milestonePercent > nextCheckpoint) {
        const pendingCheckpoint = project.milestones.find(
          m => m.percentage === nextCheckpoint && m.isCheckpoint && !m.isApprovedByCustomer
        );
        
        if (pendingCheckpoint) {
          return res.status(400).json({ 
            message: `Cannot proceed beyond ${nextCheckpoint}%. The ${nextCheckpoint}% checkpoint needs customer approval first.` 
          });
        }
        
        return res.status(400).json({ 
          message: `Cannot proceed beyond ${nextCheckpoint}%. You must reach the ${nextCheckpoint}% checkpoint and get customer approval first.` 
        });
      }

      // If this is a checkpoint and already exists, don't allow duplicate
      if (isCheckpoint) {
        const existingCheckpoint = project.milestones.find(
          m => m.percentage === milestonePercent && m.isCheckpoint
        );
        if (existingCheckpoint) {
          return res.status(400).json({ 
            message: `Checkpoint ${milestonePercent}% has already been submitted. Waiting for customer approval.` 
          });
        }
      }

      // Add new milestone (only create milestone entry for checkpoints or if message provided)
      if (isCheckpoint || milestoneMessage) {
        project.milestones.push({
          percentage: milestonePercent,
          companyMessage: milestoneMessage || `Progress update to ${milestonePercent}%`,
          isApprovedByCustomer: false,
          submittedAt: new Date(),
          isCheckpoint: isCheckpoint,
        });
      }

      // Update completion percentage
      project.completionPercentage = milestonePercent;
    }

    if (targetCompletionDate)
      project.targetCompletionDate = new Date(targetCompletionDate);
    if (currentPhase) project.currentPhase = currentPhase;

    if (req.files && req.files.mainImage)
      project.mainImagePath = req.files.mainImage[0].path.replace(/\\/g, "/");
    if (req.files && req.files.additionalImages)
      project.additionalImagePaths = req.files.additionalImages.map((file) =>
        file.path.replace(/\\/g, "/")
      );
    if (updates) {
      const updateImages = req.files && req.files.updateImages ? req.files.updateImages : [];
      const updatesArray = Array.isArray(updates) ? updates : [updates];
      project.recentUpdates = updatesArray.map((updateText, index) => ({
        updateText: updateText || "",
        updateImagePath: updateImages[0]
          ? updateImages[0].path.replace(/\\/g, "/")
          : null,
        createdAt: new Date(),
      }));
    }

    await project.save();
    res.status(200).json({ message: "Project updated successfully", project });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const submitBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { bidPrice, bidId } = req.body;
    const companyId = req.user.user_id;
    const company = await Company.findById(companyId).session(session);
    if (!company) throw new Error("Company not found");
    const bidProject = await Bid.findById(bidId).session(session);
    if (!bidProject) throw new Error("Bid not found");

    const hasExistingBid = bidProject.companyBids.some(
      (bid) => bid.companyId.toString() === companyId.toString()
    );
    if (hasExistingBid) {
      await Bid.updateOne(
        { _id: bidId, "companyBids.companyId": companyId },
        {
          $set: {
            "companyBids.$.bidPrice": Number(bidPrice),
            "companyBids.$.bidDate": new Date(),
          },
        },
        { session }
      );
    } else {
      const newBid = {
        companyId,
        companyName: company.companyName,
        bidPrice: Number(bidPrice),
        bidDate: new Date(),
      };
      await Bid.updateOne(
        { _id: bidId },
        { $push: { companyBids: newBid } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      success: true,
      message: "Bid submitted successfully",
      redirect: `/companybids?bidId=${bidId}&success=bid_submitted`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error submitting bid:", error);
    res.status(500).json({
      error: "Server error",
      redirect: `/companybids?error=server_error`,
    });
  }
};

const acceptBid = async (req, res) => {
  try {
    const { bidId, companyBidId } = req.body;
    const customerId = req.user.user_id;
    const bid = await Bid.findOne({ _id: bidId, customerId });
    if (!bid)
      return res.status(404).json({ error: "Bid not found or unauthorized" });
    const companyBid = bid.companyBids.id(companyBidId);
    if (!companyBid)
      return res.status(404).json({ error: "Company bid not found" });
    bid.status = "awarded";
    bid.winningBidId = companyBidId;
    await bid.save();
    res.json({ success: true, message: "Bid accepted successfully" });
  } catch (error) {
    console.error("Error accepting bid:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const declineBid = async (req, res) => {
  try {
    const { bidId, companyBidId } = req.body;
    const customerId = req.user.user_id;
    const bid = await Bid.findOne({ _id: bidId, customerId });
    if (!bid)
      return res.status(404).json({ error: "Bid not found or unauthorized" });
    const companyBid = bid.companyBids.id(companyBidId);
    if (!companyBid)
      return res.status(404).json({ error: "Company bid not found" });
    companyBid.status = "rejected";
    companyBid.statusChangedAt = Date.now();
    await bid.save();
    res.json({ success: true, message: "Bid declined successfully" });
  } catch (error) {
    console.error("Error declining bid:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const acceptWorkerRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await WorkerToCompany.findOne({
      _id: requestId,
      companyId: req.user.user_id,
    });
    if (!request)
      return res
        .status(404)
        .json({ error: "Request not found or not authorized" });
    request.status = "accepted";
    await request.save();
    res.status(200).json({ message: "Request accepted successfully" });
  } catch (err) {
    console.error("Error accepting request:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const rejectWorkerRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await WorkerToCompany.findOne({
      _id: requestId,
      companyId: req.user.user_id,
    });
    if (!request)
      return res
        .status(404)
        .json({ error: "Request not found or not authorized" });
    request.status = "rejected";
    await request.save();
    res.status(200).json({ message: "Request rejected successfully" });
  } catch (err) {
    console.error("Error rejecting request:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const approveMilestone = async (req, res) => {
  try {
    const { projectId, milestonePercentage } = req.body;
    const customerId = req.user.user_id;

    if (!projectId || !milestonePercentage) {
      return res.status(400).json({ error: "Project ID and milestone percentage are required" });
    }

    const project = await ConstructionProjectSchema.findOne({
      _id: projectId,
      customerId: customerId
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found or you don't have permission to approve" });
    }

    const milestone = project.milestones.find(m => m.percentage === parseInt(milestonePercentage));
    
    if (!milestone) {
      return res.status(404).json({ error: `Milestone ${milestonePercentage}% not found` });
    }

    if (milestone.isApprovedByCustomer) {
      return res.status(400).json({ error: "Milestone already approved" });
    }

    milestone.isApprovedByCustomer = true;
    milestone.approvedAt = new Date();

    await project.save();

    res.status(200).json({ 
      success: true, 
      message: `Milestone ${milestonePercentage}% approved successfully`,
      milestone 
    });
  } catch (error) {
    console.error("Error approving milestone:", error);
    res.status(500).json({ error: "Server error" });
  }
};

<<<<<<< Updated upstream
=======
const requestMilestoneRevision = async (req, res) => {
  try {
    const { projectId, milestonePercentage, feedback } = req.body;
    const customerId = req.user.user_id;

    if (!projectId || !milestonePercentage) {
      return res.status(400).json({ error: "Project ID and milestone percentage are required" });
    }

    if (!feedback || feedback.trim() === "") {
      return res.status(400).json({ error: "Please provide feedback for the revision request" });
    }

    const project = await ConstructionProjectSchema.findOne({
      _id: projectId,
      customerId: customerId
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found or you don't have permission" });
    }

    const milestone = project.milestones.find(m => m.percentage === parseInt(milestonePercentage) && m.isCheckpoint);
    
    if (!milestone) {
      return res.status(404).json({ error: `Checkpoint ${milestonePercentage}% not found` });
    }

    if (milestone.isApprovedByCustomer) {
      return res.status(400).json({ error: "Cannot request revision for already approved milestone" });
    }

    milestone.needsRevision = true;
    milestone.customerFeedback = feedback;
    milestone.feedbackAt = new Date();

    await project.save();

    res.status(200).json({ 
      success: true, 
      message: `Revision requested for ${milestonePercentage}% milestone. Company can now update their message.`,
      milestone 
    });
  } catch (error) {
    console.error("Error requesting milestone revision:", error);
    res.status(500).json({ error: "Server error" });
  }
};

>>>>>>> Stashed changes
module.exports = {
  submitArchitect,
  submitDesignRequest,
  submitConstructionForm,
  getProjects,
  getProjectById,
  getEditProject,
  updateProject,
  submitBid,
  acceptBid,
  declineBid,
  acceptWorkerRequest,
  rejectWorkerRequest,
  approveMilestone,
<<<<<<< Updated upstream
=======
  requestMilestoneRevision,
>>>>>>> Stashed changes
};
