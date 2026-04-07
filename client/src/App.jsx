import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout, ProtectedRoute } from './layouts/DashboardLayout';
import { SupplierLayout, SupplierProtectedRoute } from './layouts/SupplierLayout';
import { CustomerLayout, CustomerProtectedRoute } from './layouts/CustomerLayout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Employee/Admin pages
import Dashboard from './pages/admin/Dashboard';
import POS from './pages/employee/POS';
import Products from './pages/admin/Products';
import Inventory from './pages/admin/Inventory';
import Customers from './pages/employee/Customers';
import Employees from './pages/admin/Employees';
import Reports from './pages/admin/Reports';
import SalesTransaction from './pages/employee/SalesTransaction';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Warehouse from './pages/admin/Warehouse';
import Categories from './pages/admin/Categories';

// Supplier pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierDelivery from './pages/supplier/SupplierDelivery';
import SupplierPayments from './pages/supplier/SupplierPayments';
import SupplierProfile from './pages/supplier/SupplierProfile';

// Customer pages
import CustomerShop from './pages/customer/CustomerShop';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerProfile from './pages/customer/CustomerProfile';

// Smart root redirect based on user type
const RootRedirect = () => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!user) return null;
  if (user.userType === 'supplier') return <Navigate to="/supplier/dashboard" replace />;
  if (user.userType === 'customer') return <Navigate to="/customer/shop" replace />;
  // Employee types
  if (user.role === 'Cashier' || user.role === 'Employee') return <Navigate to="/employee/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Employee/Admin Portal */}
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['Admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/employee/dashboard" element={<ProtectedRoute roles={['Admin', 'Cashier', 'Employee']}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute roles={['Admin', 'Cashier']}><POS /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute roles={['Admin']}><Products /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute roles={['Admin']}><Categories /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute roles={['Admin']}><Inventory /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute roles={['Admin', 'Cashier']}><Customers /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute roles={['Admin']}><Employees /></ProtectedRoute>} />
            <Route path="/warehouse" element={<ProtectedRoute roles={['Admin']}><Warehouse /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute roles={['Admin']}><Reports /></ProtectedRoute>} />
            <Route path="/admin/sales" element={<ProtectedRoute roles={['Admin', 'Cashier']}><SalesTransaction /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute roles={['Admin', 'Cashier']}><EmployeeProfile /></ProtectedRoute>} />
          </Route>

          {/* Supplier Portal */}
          <Route element={<SupplierProtectedRoute />}>
            <Route element={<SupplierLayout />}>
              <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
              <Route path="/supplier/orders" element={<SupplierOrders />} />
              <Route path="/supplier/delivery" element={<SupplierDelivery />} />
              <Route path="/supplier/payments" element={<SupplierPayments />} />
              <Route path="/supplier/profile" element={<SupplierProfile />} />
            </Route>
          </Route>

          {/* Customer Portal */}
          <Route element={<CustomerProtectedRoute />}>
            <Route element={<CustomerLayout />}>
              <Route path="/customer/shop" element={<CustomerShop />} />
              <Route path="/customer/orders" element={<CustomerOrders />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
            </Route>
          </Route>

          {/* Unauthorized */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center px-4">
              <div>
                <div className="text-7xl mb-4">🚫</div>
                <h1 className="text-3xl font-black text-slate-800">Access Denied</h1>
                <p className="text-slate-500 mt-2">You don't have permission to view this page.</p>
                <a href="/login" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Return to Login</a>
              </div>
            </div>
          } />
          <Route path="*" element={<div className="p-8 text-center text-xl text-slate-400">404 — Page not found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
