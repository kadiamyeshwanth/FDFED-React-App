const { 
  Customer, 
  Company, 
  Worker, 
  ArchitectHiring,
  ConstructionProjectSchema, 
  DesignRequest,
  Bid,
  WorkerToCompany 
} = require('../models');

const getAdminDashboard = async (req, res) => {
  try {
    // Fetch all data from collections
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    const companies = await Company.find({}).sort({ createdAt: -1 });
    const workers = await Worker.find({}).sort({ createdAt: -1 });
    const architectHirings = await ArchitectHiring.find({})
      .populate('customer', 'name email')
      .populate('worker', 'name email')
      .sort({ createdAt: -1 });
    const constructionProjects = await ConstructionProjectSchema.find({})
      .populate('customerId', 'name email')
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 });
    const designRequests = await DesignRequest.find({})
      .populate('customerId', 'name email')
      .populate('workerId', 'name email')
      .sort({ createdAt: -1 });
    const bids = await Bid.find({})
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });
    const jobApplications = await WorkerToCompany.find({})
      .populate('workerId', 'name email')
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 });

    // Calculate counts
    const customersCount = customers.length;
    const companiesCount = companies.length;
    const workersCount = workers.length;

    // Calculate statistics
    const activeProjects = constructionProjects.filter(p => p.status === 'accepted').length;
    const pendingArchitectHirings = architectHirings.filter(h => h.status === 'Pending').length;
    const pendingDesignRequests = designRequests.filter(d => d.status === 'pending').length;
    const pendingRequests = pendingArchitectHirings + pendingDesignRequests;
    const openBids = bids.filter(b => b.status === 'open').length;

    // Render admin dashboard with all data
    res.render("admin/admin_dashboard", {
      customers,
      companies,
      workers,
      architectHirings,
      constructionProjects,
      designRequests,
      bids,
      jobApplications,
      // Pass counts for easy access in EJS
      customersCount,
      companiesCount,
      workersCount,
      activeProjects,
      pendingRequests,
      openBids
    });
    
  } catch (err) {
    console.error('Error fetching admin dashboard data:', err);
    res.status(500).send("Server Error");
  }
};

// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Company
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Worker
const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }
    res.json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Architect Hiring
const deleteArchitectHiring = async (req, res) => {
  try {
    const hiring = await ArchitectHiring.findByIdAndDelete(req.params.id);
    if (!hiring) {
      return res.status(404).json({ success: false, error: 'Architect hiring not found' });
    }
    res.json({ success: true, message: 'Architect hiring deleted successfully' });
  } catch (error) {
    console.error('Error deleting architect hiring:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Construction Project
const deleteConstructionProject = async (req, res) => {
  try {
    const project = await ConstructionProjectSchema.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Construction project not found' });
    }
    res.json({ success: true, message: 'Construction project deleted successfully' });
  } catch (error) {
    console.error('Error deleting construction project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Design Request
const deleteDesignRequest = async (req, res) => {
  try {
    const request = await DesignRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Design request not found' });
    }
    res.json({ success: true, message: 'Design request deleted successfully' });
  } catch (error) {
    console.error('Error deleting design request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Bid
const deleteBid = async (req, res) => {
  try {
    const bid = await Bid.findByIdAndDelete(req.params.id);
    if (!bid) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }
    res.json({ success: true, message: 'Bid deleted successfully' });
  } catch (error) {
    console.error('Error deleting bid:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Job Application
const deleteJobApplication = async (req, res) => {
  try {
    const application = await WorkerToCompany.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Job application not found' });
    }
    res.json({ success: true, message: 'Job application deleted successfully' });
  } catch (error) {
    console.error('Error deleting job application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Detail View Controllers
const getCustomerDetail = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send('Customer not found');
    }
    res.render('admin/customer-detail', { customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).send('Server Error');
  }
};

const getCompanyDetail = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).send('Company not found');
    }
    res.render('admin/company-detail', { company });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).send('Server Error');
  }
};

const getWorkerDetail = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).send('Worker not found');
    }
    res.render('admin/worker-detail', { worker });
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).send('Server Error');
  }
};

const getArchitectHiringDetail = async (req, res) => {
  try {
    const hiring = await ArchitectHiring.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('worker', 'name email specialization');
    if (!hiring) {
      return res.status(404).send('Architect hiring not found');
    }
    res.render('admin/architect-hiring-detail', { hiring });
  } catch (error) {
    console.error('Error fetching architect hiring:', error);
    res.status(500).send('Server Error');
  }
};

const getConstructionProjectDetail = async (req, res) => {
  try {
    const project = await ConstructionProjectSchema.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('companyId', 'companyName contactPerson email');
    if (!project) {
      return res.status(404).send('Construction project not found');
    }
    res.render('admin/construction-project-detail', { project });
  } catch (error) {
    console.error('Error fetching construction project:', error);
    res.status(500).send('Server Error');
  }
};

const getDesignRequestDetail = async (req, res) => {
  try {
    const request = await DesignRequest.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('workerId', 'name email specialization');
    if (!request) {
      return res.status(404).send('Design request not found');
    }
    res.render('admin/design-request-detail', { request });
  } catch (error) {
    console.error('Error fetching design request:', error);
    res.status(500).send('Server Error');
  }
};

const getBidDetail = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('companyBids.companyId', 'companyName email');
    if (!bid) {
      return res.status(404).send('Bid not found');
    }
    res.render('admin/bid-detail', { bid });
  } catch (error) {
    console.error('Error fetching bid:', error);
    res.status(500).send('Server Error');
  }
};

const getJobApplicationDetail = async (req, res) => {
  try {
    const application = await WorkerToCompany.findById(req.params.id)
      .populate('workerId', 'name email phone specialization')
      .populate('companyId', 'companyName contactPerson email');
    if (!application) {
      return res.status(404).send('Job application not found');
    }
    res.render('admin/job-application-detail', { application });
  } catch (error) {
    console.error('Error fetching job application:', error);
    res.status(500).send('Server Error');
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
  getJobApplicationDetail
};