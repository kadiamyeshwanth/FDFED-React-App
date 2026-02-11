const verifyCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: 'verified' },
      { new: true }
    );
    if (!company) return res.status(404).json({ success: false, error: 'Company not found' });
    res.json({ success: true, message: 'Company verified successfully', company });
  } catch (error) {
    console.error('Error verifying company:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const rejectCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!company) return res.status(404).json({ success: false, error: 'Company not found' });
    res.json({ success: true, message: 'Company rejected', company });
  } catch (error) {
    console.error('Error rejecting company:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const verifyWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { status: 'verified' },
      { new: true }
    );
    if (!worker) return res.status(404).json({ success: false, error: 'Worker not found' });
    res.json({ success: true, message: 'Worker verified successfully', worker });
  } catch (error) {
    console.error('Error verifying worker:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const rejectWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!worker) return res.status(404).json({ success: false, error: 'Worker not found' });
    res.json({ success: true, message: 'Worker rejected', worker });
  } catch (error) {
    console.error('Error rejecting worker:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
const {
  Customer,
  Company,
  Worker,
  ArchitectHiring,
  ConstructionProjectSchema,
  DesignRequest,
  Bid,
  WorkerToCompany,
} = require("../models");

const getAdminDashboard = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    const companies = await Company.find({}).sort({ createdAt: -1 });
    const workers = await Worker.find({}).sort({ createdAt: -1 });
    const architectHirings = await ArchitectHiring.find({})
      .populate("customer", "name email")
      .populate("worker", "name email")
      .sort({ createdAt: -1 });
    const constructionProjects = await ConstructionProjectSchema.find({})
      .populate("customerId", "name email")
      .populate("companyId", "companyName")
      .sort({ createdAt: -1 });
    const designRequests = await DesignRequest.find({})
      .populate("customerId", "name email")
      .populate("workerId", "name email")
      .sort({ createdAt: -1 });
    const bids = await Bid.find({})
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });
    const jobApplications = await WorkerToCompany.find({})
      .populate("workerId", "name email")
      .populate("companyId", "companyName")
      .sort({ createdAt: -1 });

    const customersCount = customers.length;
    const companiesCount = companies.length;
    const workersCount = workers.length;

    const activeProjects = constructionProjects.filter(
      (p) => p.status === "accepted"
    ).length;
    const pendingArchitectHirings = architectHirings.filter(
      (h) => h.status === "Pending"
    ).length;
    const pendingDesignRequests = designRequests.filter(
      (d) => d.status === "pending"
    ).length;
    const pendingRequests = pendingArchitectHirings + pendingDesignRequests;
    const openBids = bids.filter((b) => b.status === "open").length;

    // Calculate revenue from Architect Hirings
    let architectHiringRevenue = {
      totalProjects: architectHirings.length,
      totalRevenue: 0,
      platformCommission: 0,
      workerPayout: 0,
      activeProjects: 0,
      completedProjects: 0,
    };

    architectHirings.forEach(hiring => {
      if (hiring.paymentDetails && hiring.paymentDetails.totalAmount) {
        architectHiringRevenue.totalRevenue += hiring.paymentDetails.totalAmount || 0;
        architectHiringRevenue.platformCommission += hiring.paymentDetails.platformCommission || 0;
        architectHiringRevenue.workerPayout += hiring.paymentDetails.workerAmount || 0;
        
        if (hiring.status === 'accepted' || hiring.status === 'In-Progress') {
          architectHiringRevenue.activeProjects++;
        } else if (hiring.status === 'Completed') {
          architectHiringRevenue.completedProjects++;
        }
      }
    });

    // Calculate revenue from Design Requests
    let designRequestRevenue = {
      totalProjects: designRequests.length,
      totalRevenue: 0,
      platformCommission: 0,
      workerPayout: 0,
      activeProjects: 0,
      completedProjects: 0,
    };

    designRequests.forEach(request => {
      if (request.paymentDetails && request.paymentDetails.totalAmount) {
        designRequestRevenue.totalRevenue += request.paymentDetails.totalAmount || 0;
        designRequestRevenue.platformCommission += request.paymentDetails.platformCommission || 0;
        designRequestRevenue.workerPayout += request.paymentDetails.workerAmount || 0;
        
        if (request.status === 'accepted' || request.status === 'In-Progress') {
          designRequestRevenue.activeProjects++;
        } else if (request.status === 'Completed') {
          designRequestRevenue.completedProjects++;
        }
      }
    });

    // Combined revenue metrics
    const totalPlatformRevenue = architectHiringRevenue.platformCommission + designRequestRevenue.platformCommission;
    const totalProjectRevenue = architectHiringRevenue.totalRevenue + designRequestRevenue.totalRevenue;

    res.status(200).json({
      counts: {
        customers: customersCount,
        companies: companiesCount,
        workers: workersCount,
      },
      stats: {
        activeProjects,
        pendingRequests,
        openBids,
      },
      revenue: {
        architectHiring: architectHiringRevenue,
        designRequest: designRequestRevenue,
        combined: {
          totalPlatformCommission: totalPlatformRevenue,
          totalProjectRevenue: totalProjectRevenue,
          totalProjects: architectHiringRevenue.totalProjects + designRequestRevenue.totalProjects,
        }
      },
      data: {
        customers,
        companies,
        workers,
        architectHirings,
        constructionProjects,
        designRequests,
        bids,
        jobApplications,
      },
    });
  } catch (err) {
    console.error("Error fetching admin dashboard data:", err);
    res.status(500).send("Server Error");
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: "Customer not found" });
    }
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, error: "Company not found" });
    }
    res.json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res
        .status(404)
        .json({ success: false, error: "Worker not found" });
    }
    res.json({ success: true, message: "Worker deleted successfully" });
  } catch (error) {
    console.error("Error deleting worker:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteArchitectHiring = async (req, res) => {
  try {
    const hiring = await ArchitectHiring.findByIdAndDelete(req.params.id);
    if (!hiring) {
      return res
        .status(404)
        .json({ success: false, error: "Architect hiring not found" });
    }
    res.json({
      success: true,
      message: "Architect hiring deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting architect hiring:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteConstructionProject = async (req, res) => {
  try {
    const project = await ConstructionProjectSchema.findByIdAndDelete(
      req.params.id
    );
    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: "Construction project not found" });
    }
    res.json({
      success: true,
      message: "Construction project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting construction project:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteDesignRequest = async (req, res) => {
  try {
    const request = await DesignRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, error: "Design request not found" });
    }
    res.json({ success: true, message: "Design request deleted successfully" });
  } catch (error) {
    console.error("Error deleting design request:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteBid = async (req, res) => {
  try {
    const bid = await Bid.findByIdAndDelete(req.params.id);
    if (!bid) {
      return res.status(404).json({ success: false, error: "Bid not found" });
    }
    res.json({ success: true, message: "Bid deleted successfully" });
  } catch (error) {
    console.error("Error deleting bid:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteJobApplication = async (req, res) => {
  try {
    const application = await WorkerToCompany.findByIdAndDelete(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, error: "Job application not found" });
    }
    res.json({
      success: true,
      message: "Job application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job application:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCustomerDetail = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const getCompanyDetail = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json({ company });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const getWorkerDetail = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: "Worker not found" });
    }
    res.json({ worker });
  } catch (error) {
    console.error("Error fetching worker:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const getArchitectHiringDetail = async (req, res) => {
  try {
    const hiring = await ArchitectHiring.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("worker", "name email specialization");
    if (!hiring) {
      return res.status(404).json({ error: "Architect hiring not found" });
    }
    res.json({ hiring });
  } catch (error) {
    console.error("Error fetching architect hiring:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const getConstructionProjectDetail = async (req, res) => {
  try {
    const project = await ConstructionProjectSchema.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("companyId", "companyName contactPerson email");
    if (!project) {
      return res.status(404).json({ error: "Construction project not found" });
    }
    res.json({ project });
  } catch (error) {
    console.error("Error fetching construction project:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const getDesignRequestDetail = async (req, res) => {
  try {
    const request = await DesignRequest.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("workerId", "name email specialization");
    if (!request) {
      return res.status(404).json({ error: "Design request not found" });
    }
    res.json({ request });
  } catch (error) {
    console.error("Error fetching design request:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const getBidDetail = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("companyBids.companyId", "companyName email");
    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }
    // routed file : admin/bid-detail
    res.json({ bid });
  } catch (error) {
    console.error("Error fetching bid:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const getJobApplicationDetail = async (req, res) => {
  try {
    const application = await WorkerToCompany.findById(req.params.id)
      .populate("workerId", "name email phone specialization")
      .populate("companyId", "companyName contactPerson email");
    if (!application) {
      return res.status(404).json({ error: "Job application not found" });
    }
    // routed file : admin/job-application-detail
    res.json({ application });
  } catch (error) {
    console.error("Error fetching job application:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const getAdminRevenue = async (req, res) => {
  try {
    // Fetch all construction projects with company and customer details
    const constructionProjects = await ConstructionProjectSchema.find({})
      .populate("customerId", "name email phone")
      .populate("companyId", "companyName email contactPerson")
      .sort({ createdAt: -1 });
    
    // Fetch architect hirings
    const architectHirings = await ArchitectHiring.find({})
      .populate("customer", "name email phone")
      .populate("worker", "name email specialization")
      .sort({ createdAt: -1 });
    
    // Fetch design requests
    const designRequests = await DesignRequest.find({})
      .populate("customerId", "name email phone")
      .populate("workerId", "name email specialization")
      .sort({ createdAt: -1 });
    
    console.log(`📊 Admin Revenue: Found ${constructionProjects.length} construction, ${architectHirings.length} architect, ${designRequests.length} design projects`);

    // Initialize totals
    let totalPlatformRevenue = 0;
    let totalReceivedRevenue = 0;
    let totalPendingRevenue = 0;
    
    // Construction Projects Revenue
    let constructionRevenue = {
      totalProjects: constructionProjects.length,
      platformRevenue: 0,
      receivedRevenue: 0,
      pendingRevenue: 0,
      activeProjects: 0,
      completedProjects: 0,
    };
    
    // Phase analytics
    const phaseAnalytics = {
      phase1: { total: 0, received: 0, pending: 0 },
      phase2: { total: 0, received: 0, pending: 0 },
      phase3: { total: 0, received: 0, pending: 0 },
      phase4: { total: 0, received: 0, pending: 0 },
      final: { total: 0, received: 0, pending: 0 },
    };

    const constructionProjectsWithDetails = constructionProjects.map((project) => {
      const totalBudget = project.paymentDetails?.totalAmount || project.proposal?.price || 0;
      const phaseAmount = totalBudget * 0.25; // 25% per phase
      const finalPhaseAmount = totalBudget * 0.1; // 10% final phase

      let projectReceived = 0;
      let projectPending = 0;
      const phaseBreakdown = [];

      for (let i = 1; i <= 4; i++) {
        const milestone = project.milestones?.find((m) => m.percentage === i * 25);
        
        const upfrontAmount = phaseAmount * 0.4;
        const upfrontStatus = milestone?.payments?.upfront?.status || "pending";
        const upfrontReceived = (upfrontStatus === "released" || upfrontStatus === "paid") 
          ? (milestone?.payments?.upfront?.amount || upfrontAmount) 
          : 0;
        const upfrontPending = upfrontAmount - upfrontReceived;

        const completionAmount = phaseAmount * 0.6;
        const completionStatus = milestone?.payments?.completion?.status || "pending";
        const completionReceived = (completionStatus === "released" || completionStatus === "paid") 
          ? (milestone?.payments?.completion?.amount || completionAmount) 
          : 0;
        const completionPending = completionAmount - completionReceived;

        const phaseReceived = upfrontReceived + completionReceived;
        const phasePending = upfrontPending + completionPending;

        projectReceived += phaseReceived;
        projectPending += phasePending;

        phaseAnalytics[`phase${i}`].total += phaseAmount;
        phaseAnalytics[`phase${i}`].received += phaseReceived;
        phaseAnalytics[`phase${i}`].pending += phasePending;

        phaseBreakdown.push({
          phase: i,
          totalAmount: phaseAmount,
          upfront: { amount: upfrontAmount, status: upfrontStatus, received: upfrontReceived },
          completion: { amount: completionAmount, status: completionStatus, received: completionReceived },
          totalReceived: phaseReceived,
          totalPending: phasePending,
        });
      }

      const finalMilestone = project.milestones?.find((m) => m.percentage === 100);
      const finalStatus = finalMilestone?.payments?.final?.status || "pending";
      const finalReceived = (finalStatus === "released" || finalStatus === "paid") 
        ? (finalMilestone?.payments?.final?.amount || finalPhaseAmount) 
        : 0;
      const finalPending = finalPhaseAmount - finalReceived;

      projectReceived += finalReceived;
      projectPending += finalPending;

      phaseAnalytics.final.total += finalPhaseAmount;
      phaseAnalytics.final.received += finalReceived;
      phaseAnalytics.final.pending += finalPending;

      phaseBreakdown.push({
        phase: 5,
        isFinal: true,
        totalAmount: finalPhaseAmount,
        final: { amount: finalPhaseAmount, status: finalStatus, received: finalReceived },
        totalReceived: finalReceived,
        totalPending: finalPending,
      });

      const projectTotal = totalBudget * 1.1;

      totalPlatformRevenue += projectTotal;
      totalReceivedRevenue += projectReceived;
      totalPendingRevenue += projectPending;
      
      constructionRevenue.platformRevenue += projectTotal;
      constructionRevenue.receivedRevenue += projectReceived;
      constructionRevenue.pendingRevenue += projectPending;

      return {
        _id: project._id,
        projectType: 'construction',
        projectName: project.projectName,
        status: project.status,
        completionPercentage: project.completionPercentage || 0,
        customer: {
          _id: project.customerId?._id,
          name: project.customerId?.name || project.customerName || "Unknown",
          email: project.customerId?.email || project.customerEmail || "",
          phone: project.customerId?.phone || project.customerPhone || "",
        },
        company: {
          _id: project.companyId?._id,
          name: project.companyId?.companyName || "Unknown Company",
          email: project.companyId?.email || "",
          contactPerson: project.companyId?.contactPerson || "",
        },
        totalAmount: projectTotal,
        receivedAmount: projectReceived,
        pendingAmount: projectPending,
        phaseBreakdown,
        createdAt: project.createdAt,
      };
    });

    constructionRevenue.activeProjects = constructionProjects.filter((p) => p.status === "accepted" || p.status === "ongoing").length;
    constructionRevenue.completedProjects = constructionProjects.filter((p) => p.status === "completed").length;

    // Process Architect Hirings
    let architectHiringRevenue = {
      totalProjects: architectHirings.length,
      platformRevenue: 0,
      receivedRevenue: 0,
      pendingRevenue: 0,
      activeProjects: 0,
      completedProjects: 0,
    };

    const architectHiringsWithDetails = architectHirings.map((hiring) => {
      const totalAmount = hiring.paymentDetails?.totalAmount || 0;
      const platformCommission = hiring.paymentDetails?.platformCommission || 0;
      const workerAmount = hiring.paymentDetails?.workerAmount || 0;
      const escrowStatus = hiring.paymentDetails?.escrowStatus || 'not_initiated';
      
      // Calculate received and pending amounts based on milestone payments
      let receivedAmount = 0;
      let pendingAmount = 0;
      
      if (hiring.paymentDetails?.milestonePayments) {
        hiring.paymentDetails.milestonePayments.forEach(milestone => {
          if (milestone.paymentCollected) {
            receivedAmount += milestone.platformFee || 0;
          } else {
            pendingAmount += milestone.platformFee || 0;
          }
        });
      }
      
      if (totalAmount > 0) {
        totalPlatformRevenue += platformCommission;
        totalReceivedRevenue += receivedAmount;
        totalPendingRevenue += pendingAmount;
        
        architectHiringRevenue.platformRevenue += platformCommission;
        architectHiringRevenue.receivedRevenue += receivedAmount;
        architectHiringRevenue.pendingRevenue += pendingAmount;
      }
      
      if (hiring.status === 'accepted' || hiring.status === 'In-Progress') {
        architectHiringRevenue.activeProjects++;
      } else if (hiring.status === 'Completed') {
        architectHiringRevenue.completedProjects++;
      }
      
      return {
        _id: hiring._id,
        projectType: 'architect',
        projectName: hiring.projectName || 'Architecture Project',
        status: hiring.status,
        customer: {
          _id: hiring.customer?._id,
          name: hiring.customer?.name || hiring.customerDetails?.fullName || "Unknown",
          email: hiring.customer?.email || hiring.customerDetails?.email || "",
          phone: hiring.customer?.phone || hiring.customerDetails?.contactNumber || "",
        },
        worker: {
          _id: hiring.worker?._id,
          name: hiring.worker?.name || "Not Assigned",
          email: hiring.worker?.email || "",
          specialization: hiring.worker?.specialization || "",
        },
        totalAmount: totalAmount,
        platformCommission: platformCommission,
        workerAmount: workerAmount,
        receivedAmount: receivedAmount,
        pendingAmount: pendingAmount,
        escrowStatus: escrowStatus,
        createdAt: hiring.createdAt,
      };
    });

    // Process Design Requests
    let designRequestRevenue = {
      totalProjects: designRequests.length,
      platformRevenue: 0,
      receivedRevenue: 0,
      pendingRevenue: 0,
      activeProjects: 0,
      completedProjects: 0,
    };

    const designRequestsWithDetails = designRequests.map((request) => {
      const totalAmount = request.paymentDetails?.totalAmount || 0;
      const platformCommission = request.paymentDetails?.platformCommission || 0;
      const workerAmount = request.paymentDetails?.workerAmount || 0;
      const escrowStatus = request.paymentDetails?.escrowStatus || 'not_initiated';
      
      // Calculate received and pending amounts based on milestone payments
      let receivedAmount = 0;
      let pendingAmount = 0;
      
      if (request.paymentDetails?.milestonePayments) {
        request.paymentDetails.milestonePayments.forEach(milestone => {
          if (milestone.paymentCollected) {
            receivedAmount += milestone.platformFee || 0;
          } else {
            pendingAmount += milestone.platformFee || 0;
          }
        });
      }
      
      if (totalAmount > 0) {
        totalPlatformRevenue += platformCommission;
        totalReceivedRevenue += receivedAmount;
        totalPendingRevenue += pendingAmount;
        
        designRequestRevenue.platformRevenue += platformCommission;
        designRequestRevenue.receivedRevenue += receivedAmount;
        designRequestRevenue.pendingRevenue += pendingAmount;
      }
      
      if (request.status === 'accepted' || request.status === 'In-Progress') {
        designRequestRevenue.activeProjects++;
      } else if (request.status === 'Completed') {
        designRequestRevenue.completedProjects++;
      }
      
      return {
        _id: request._id,
        projectType: 'interior',
        projectName: request.projectName || `${request.roomType} Design`,
        status: request.status,
        customer: {
          _id: request.customerId?._id,
          name: request.customerId?.name || request.fullName || "Unknown",
          email: request.customerId?.email || request.email || "",
          phone: request.customerId?.phone || request.phone || "",
        },
        worker: {
          _id: request.workerId?._id,
          name: request.workerId?.name || "Not Assigned",
          email: request.workerId?.email || "",
          specialization: request.workerId?.specialization || "",
        },
        totalAmount: totalAmount,
        platformCommission: platformCommission,
        workerAmount: workerAmount,
        receivedAmount: receivedAmount,
        pendingAmount: pendingAmount,
        escrowStatus: escrowStatus,
        roomType: request.roomType,
        createdAt: request.createdAt,
      };
    });

    // Combine all projects
    const allProjects = [
      ...constructionProjectsWithDetails,
      ...architectHiringsWithDetails,
      ...designRequestsWithDetails
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const activeProjectsCount = constructionRevenue.activeProjects + architectHiringRevenue.activeProjects + designRequestRevenue.activeProjects;
    const completedProjectsCount = constructionRevenue.completedProjects + architectHiringRevenue.completedProjects + designRequestRevenue.completedProjects;
    const collectionRate = totalPlatformRevenue > 0 
      ? ((totalReceivedRevenue / totalPlatformRevenue) * 100).toFixed(2) 
      : 0;

    console.log(`💰 Admin Revenue Summary:`);
    console.log(`   Total Revenue: ₹${totalPlatformRevenue.toLocaleString('en-IN')}`);
    console.log(`   Received: ₹${totalReceivedRevenue.toLocaleString('en-IN')}`);
    console.log(`   Pending: ₹${totalPendingRevenue.toLocaleString('en-IN')}`);
    console.log(`   Collection Rate: ${collectionRate}%`);
    console.log(`   Active Projects: ${activeProjectsCount}, Completed: ${completedProjectsCount}`);
    console.log(`   Construction: ${constructionRevenue.platformRevenue.toLocaleString('en-IN')}`);
    console.log(`   Architect: ${architectHiringRevenue.platformRevenue.toLocaleString('en-IN')}`);
    console.log(`   Interior: ${designRequestRevenue.platformRevenue.toLocaleString('en-IN')}`);

    res.json({
      success: true,
      metrics: {
        totalRevenue: totalPlatformRevenue,
        receivedRevenue: totalReceivedRevenue,
        pendingRevenue: totalPendingRevenue,
        collectionRate: parseFloat(collectionRate),
        activeProjects: activeProjectsCount,
        completedProjects: completedProjectsCount,
        totalProjects: allProjects.length,
      },
      revenueByType: {
        construction: constructionRevenue,
        architect: architectHiringRevenue,
        interior: designRequestRevenue,
      },
      phaseAnalytics,
      projects: allProjects,
      constructionProjects: constructionProjectsWithDetails,
      architectHirings: architectHiringsWithDetails,
      designRequests: designRequestsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching admin revenue:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  deleteCustomer,
  deleteCompany,
  deleteWorker,
  deleteArchitectHiring,
  deleteConstructionProject,
  deleteDesignRequest,
  deleteBid,
  deleteJobApplication,
  getCustomerDetail,
  getCompanyDetail,
  getWorkerDetail,
  getArchitectHiringDetail,
  getConstructionProjectDetail,
  getDesignRequestDetail,
  getBidDetail,
  getJobApplicationDetail,
  verifyCompany,
  rejectCompany,
  verifyWorker,
  rejectWorker,
  getAdminRevenue,
};
