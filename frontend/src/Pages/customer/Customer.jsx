// src/Pages/customer/Customer.jsx
import CustomerNavbar from "./components/customer-navbar/CustomerNavbar";
import CustomerHome from "./components/customer-home/CustomerHome";
import CustomerConstruction from "./components/customer-construction/CustomerConstruction";

const Customer = () => {
  return (
    <>
      <CustomerNavbar />
      {/* <CustomerHome /> */}
      <CustomerConstruction />
    </>
  );
};

export default Customer;
