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

    // routed file : admin/admin_dashboard
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
    // routed file : admin/customer-detail
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
    // routed file : admin/company-detail
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
    // routed file : admin/worker-detail
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
    // routed file : admin/architect-hiring-detail
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
    // routed file : admin/construction-project-detail
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
    // routed file : admin/design-request-detail
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
};