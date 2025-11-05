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

    // Validation...
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
      customerId : customer,
      inspirationImages,
      workerId,
    });
    await designRequest.save();
    res.status(201).json({ message: "Design request submitted successfully" ,success:true});
  } catch (error) {
    res.status(500).json({ error: "Server error" ,success:false});
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
    res
      .status(201)
      .json({
        success: true,
        message: "Project submitted successfully",
        projectId: newProject._id,
      });
  } catch (error) {
    console.error("Error submitting project:", error);
    res
      .status(500)
      .json({
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
    res.render("projects", { projects });
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
    if (!project) return res.status(404).send("Project not found");
    res.render("company/addnewproject_form", { project });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).send("Server error");
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
    } = req.body;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ message: "Invalid project ID" });
    const project = await ConstructionProjectSchema.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (completionPercentage)
      project.completionPercentage = parseInt(completionPercentage);
    if (targetCompletionDate)
      project.targetCompletionDate = new Date(targetCompletionDate);
    if (currentPhase) project.currentPhase = currentPhase;

    if (req.files.mainImage)
      project.mainImagePath = req.files.mainImage[0].path.replace(/\//g, "\\");
    if (req.files.additionalImages)
      project.additionalImagePaths = req.files.additionalImages.map((file) =>
        file.path.replace(/\//g, "\\")
      );
    if (updates) {
      const updateImages = req.files.updateImages || [];
      const updatesArray = Array.isArray(updates) ? updates : [updates];
      project.recentUpdates = updatesArray.map((updateText, index) => ({
        updateText: updateText || "",
        updateImagePath: updateImages[0]
          ? updateImages[0].path.replace(/\//g, "\\")
          : null,
        createdAt: new Date(),
      }));
    }

    await project.save();
    res.status(200).json({ message: "Project updated successfully" });
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
    // Validation...
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
    res.redirect(`/companybids?bidId=${bidId}&success=bid_submitted`);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error submitting bid:", error);
    res.redirect(`/companybids?error=server_error`);
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

// Add other project-related controllers like worker request accept/reject, etc.

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
};
