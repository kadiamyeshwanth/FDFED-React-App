import React from "react";
import "./AdminUIComponents.css";

/* Card Component */
export const Card = ({ children, className = "", ...props }) => (
  <div className={`admin-card ${className}`} {...props}>
    {children}
  </div>
);

/* Stat Card Component */
export const StatCard = ({ title, value, icon: Icon, color = "blue", trend = null }) => (
  <div className={`stat-card stat-card-${color}`}>
    <div className="stat-header">
      <h3 className="stat-title">{title}</h3>
      {Icon && <Icon size={20} className="stat-icon" />}
    </div>
    <div className="stat-value">{value}</div>
    {trend && <div className={`stat-trend ${trend > 0 ? "positive" : "negative"}`}>
      {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last month
    </div>}
  </div>
);

/* KPI Card Component */
export const KPICard = ({ title, value, unit = "", description = "", icon: Icon, color = "blue" }) => (
  <div className={`kpi-card kpi-${color}`}>
    <div className="kpi-icon-wrapper">
      {Icon && <Icon size={24} />}
    </div>
    <div className="kpi-content">
      <h4 className="kpi-title">{title}</h4>
      <div className="kpi-value">
        {value}
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
      {description && <p className="kpi-description">{description}</p>}
    </div>
  </div>
);

/* Badge Component */
export const Badge = ({ children, variant = "default", size = "md" }) => (
  <span className={`badge badge-${variant} badge-${size}`}>{children}</span>
);

/* Action Button Component */
export const ActionButton = ({
  label,
  icon: Icon,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  ...props
}) => (
  <button
    className={`action-btn action-btn-${variant} action-btn-${size}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {Icon && <Icon size={16} />}
    <span>{label}</span>
  </button>
);

/* Data Row Component */
export const DataRow = ({ label, value, children }) => (
  <div className="data-row">
    <span className="data-label">{label}</span>
    <span className="data-value">{children || value}</span>
  </div>
);

/* Section Component */
export const Section = ({ title, subtitle, children, className = "" }) => (
  <section className={`admin-section ${className}`}>
    {(title || subtitle) && (
      <header className="section-header">
        {title && <h2 className="section-title">{title}</h2>}
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </header>
    )}
    <div className="section-content">{children}</div>
  </section>
);

/* Table Component */
export const AdminTable = ({ columns, data, onRowClick, actions }) => (
  <div className="table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          {actions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map((row, idx) => (
            <tr key={row._id || idx} onClick={() => onRowClick?.(row)}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="actions-cell">
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      className={`table-action-btn table-action-${action.variant}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                    >
                      {action.icon && <action.icon size={14} />}
                      {action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + (actions ? 1 : 0)} className="empty-cell">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

/* Empty State Component */
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    {Icon && <Icon size={48} className="empty-icon" />}
    <h3 className="empty-title">{title}</h3>
    {description && <p className="empty-description">{description}</p>}
    {action && <button className="empty-action-btn">{action}</button>}
  </div>
);

/* Modal/Overlay Component */
export const Modal = ({ isOpen, title, children, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal">
        {title && (
          <header className="modal-header">
            <h2>{title}</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </header>
        )}
        <div className="modal-content">{children}</div>
        {actions && (
          <footer className="modal-footer">
            {actions.map((action, i) => (
              <button
                key={i}
                className={`modal-btn modal-btn-${action.variant}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </footer>
        )}
      </div>
    </>
  );
};

/* Loading Spinner Component */
export const Spinner = ({ size = "md" }) => (
  <div className={`spinner spinner-${size}`}>
    <div className="spinner-ring"></div>
  </div>
);

/* Header Component */
export const PageHeader = ({ title, subtitle, actions }) => (
  <header className="page-header">
    <div className="page-header-content">
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </header>
);
