import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavbarCompany from '../../components/NavbarCompany/NavbarCompany';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'worker',
    salary: '',
    joinDate: '',
    address: '',
    emergencyContact: ''
  });
  const [errors, setErrors] = useState({});

  const employeesPerPage = 10;

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (resres.ok) {
        setEmployees(data);
      } else {
        alert('Failed to load employees');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading employees');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone.includes(searchTerm);

    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const indexOfLast = currentPage * employeesPerPage;
  const indexOfFirst = indexOfLast - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const paginate = (page) => setCurrentPage(page);

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', role: 'worker', salary: '', joinDate: '', address: '', emergencyContact: ''
    });
    setErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      salary: emp.salary,
      joinDate: emp.joinDate.split('T')[0],
      address: emp.address || '',
      emergencyContact: emp.emergencyContact || ''
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Invalid email';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone is required';
        else if (!/^\d{10}$/.test(value)) error = 'Phone must be 10 digits';
        break;
      case 'salary':
        if (!value.trim()) error = 'Salary is required';
        else if (isNaN(value) || Number(value) <= 0) error = 'Invalid salary';
        break;
      case 'joinDate':
        if (!value) error = 'Join date is required';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ['name', 'email', 'phone', 'salary', 'joinDate'];
    let isValid = true;
    fields.forEach(field => {
      if (!validateField(field, formData[field])) isValid = false;
    });
    return isValid;
  };

  // Add Employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (res.ok) {
        setEmployees(prev => [...prev, result.employee]);
        setShowAddModal(false);
        resetForm();
        alert('Employee added successfully');
      } else {
        alert(result.message || 'Failed to add employee');
      }
    } catch (err) {
      alert('Error adding employee');
    }
  };

  // Edit Employee
  const handleEditEmployee = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/employees/${selectedEmployee._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (res.ok) {
        setEmployees(prev => prev.map(e => e._id === selectedEmployee._id ? result.employee : e));
        setShowEditModal(false);
        resetForm();
        alert('Employee updated successfully');
      } else {
        alert(result.message || 'Failed to update');
      }
    } catch (err) {
      alert('Error updating employee');
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEmployees(prev => prev.filter(e => e._id !== id));
        alert('Employee removed');
      } else {
        alert('Failed to delete');
      }
    } catch (err) {
      alert('Error deleting employee');
    }
  };

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <>
      <NavbarCompany />
      <div className="employees-container">
        <div className="employees-header">
          <h1>Employees Management</h1>
          <button className="btn-add" onClick={openAddModal}>
            Add New Employee
          </button>
        </div>

        {/* Search & Filter */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="worker">Worker</option>
            <option value="supervisor">Supervisor</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Employees Table */}
        <div className="table-container">
          {currentEmployees.length === 0 ? (
            <p className="no-data">No employees found.</p>
          ) : (
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Salary</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.map(emp => (
                  <tr key={emp._id}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td>
                      <span className={`badge ${emp.role}`}>
                        {emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}
                      </span>
                    </td>
                    <td>₹{parseFloat(emp.salary).toLocaleString('en-IN')}</td>
                    <td>{new Date(emp.joinDate).toLocaleDateString('en-IN')}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => openEditModal(emp)}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteEmployee(emp._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={currentPage === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add New Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                  {errors.name && <span className="error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
                  {errors.phone && <span className="error">{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="worker">Worker</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Salary (₹) *</label>
                  <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} min="0" />
                  {errors.salary && <span className="error">{errors.salary}</span>}
                </div>
                <div className="form-group">
                  <label>Join Date *</label>
                  <input type="date" name="joinDate" value={formData.joinDate} onChange={handleInputChange} />
                  {errors.joinDate && <span className="error">{errors.joinDate}</span>}
                </div>
                <div className="form-group full">
                  <label>Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" />
                </div>
                <div className="form-group full">
                  <label>Emergency Contact</label>
                  <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Employee</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Employee</h2>
            <form onSubmit={handleEditEmployee}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                  {errors.name && <span className="error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
                  {errors.phone && <span className="error">{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="worker">Worker</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Salary (₹) *</label>
                  <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} min="0" />
                  {errors.salary && <span className="error">{errors.salary}</span>}
                </div>
                <div className="form-group">
                  <label>Join Date *</label>
                  <input type="date" name="joinDate" value={formData.joinDate} onChange={handleInputChange} />
                  {errors.joinDate && <span className="error">{errors.joinDate}</span>}
                </div>
                <div className="form-group full">
                  <label>Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" />
                </div>
                <div className="form-group full">
                  <label>Emergency Contact</label>
                  <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Update Employee</button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Employees;