import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Pages
import { Dashboard } from './pages/Dashboard';
import { VehicleList } from './pages/Vehicles/VehicleList';
import { VehicleProfile } from './pages/Vehicles/VehicleProfile';
import { VehicleForm } from './pages/Vehicles/VehicleForm';
import { RevenueList } from './pages/Revenue/RevenueList';
import { RevenueForm } from './pages/Revenue/RevenueForm';
import { ExpenseList } from './pages/Expenses/ExpenseList';
import { ExpenseForm } from './pages/Expenses/ExpenseForm';
import { FuelList } from './pages/Fuel/FuelList';
import { FuelForm } from './pages/Fuel/FuelForm';
import { MaintenanceList } from './pages/Maintenance/MaintenanceList';
import { MaintenanceForm } from './pages/Maintenance/MaintenanceForm';
import { MoreMenu } from './pages/More/MoreMenu';

// Placeholder Pages (To be implemented)
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-4"><h1 className="text-xl font-bold">{title}</h1><p className="mt-4 text-gray-400">Coming soon.</p></div>
);

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/vehicles/add" element={<VehicleForm />} />
          <Route path="/vehicles/:id" element={<VehicleProfile />} />
          <Route path="/vehicles/edit/:id" element={<VehicleForm />} />
          
          <Route path="/revenue" element={<RevenueList />} />
          <Route path="/revenue/add" element={<RevenueForm />} />
          <Route path="/revenue/edit/:id" element={<RevenueForm />} />
          
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/expenses/add" element={<ExpenseForm />} />
          <Route path="/expenses/edit/:id" element={<ExpenseForm />} />
          
          <Route path="/fuel" element={<FuelList />} />
          <Route path="/fuel/add" element={<FuelForm />} />
          <Route path="/fuel/edit/:id" element={<FuelForm />} />
          
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/maintenance/add" element={<MaintenanceForm />} />
          <Route path="/maintenance/edit/:id" element={<MaintenanceForm />} />
          
          <Route path="/more" element={<MoreMenu />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
