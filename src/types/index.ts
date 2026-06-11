// ============================================================
// Shared TypeScript Types for Fleet Manager Kenya
// ============================================================

export type VehicleType = 'matatu' | 'truck' | 'pickup' | 'bus';
export type VehicleStatus = 'active' | 'in_service' | 'sold' | 'suspended';
export type PaymentStatus = 'paid' | 'pending' | 'partial';
export type RevenueType = 'daily_collection' | 'trip';
export type ExpenseCategory =
  | 'fuel'
  | 'repairs'
  | 'maintenance'
  | 'salaries'
  | 'insurance'
  | 'parking'
  | 'fines'
  | 'licenses'
  | 'route_fees'
  | 'misc';
export type ServiceType =
  | 'oil_change'
  | 'tyres'
  | 'brakes'
  | 'engine'
  | 'suspension'
  | 'insurance'
  | 'inspection'
  | 'other';
export type ReminderType = 'service' | 'insurance' | 'license' | 'custom';

export interface Vehicle {
  id: string;
  type: VehicleType;
  reg_number: string;
  nickname?: string;
  make?: string;
  model?: string;
  year?: number;
  capacity?: number;
  status: VehicleStatus;
  insurance_expiry?: string;
  license_expiry?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RevenueLog {
  id: string;
  vehicle_id: string;
  revenue_type: RevenueType;
  amount: number;
  route?: string;
  driver_remittance?: number;
  conductor_remittance?: number;
  client?: string;
  origin?: string;
  destination?: string;
  cargo_type?: string;
  payment_status: PaymentStatus;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined
  vehicle?: Vehicle;
}

export interface ExpenseLog {
  id: string;
  vehicle_id?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined
  vehicle?: Vehicle;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  liters: number;
  cost_per_liter?: number;
  total_cost: number;
  fuel_station?: string;
  odometer?: number;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined
  vehicle?: Vehicle;
}

export interface MaintenanceLog {
  id: string;
  vehicle_id: string;
  service_type: ServiceType;
  garage?: string;
  cost?: number;
  date: string;
  next_service_date?: string;
  odometer?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined
  vehicle?: Vehicle;
}

export interface Reminder {
  id: string;
  vehicle_id: string;
  type: ReminderType;
  title: string;
  due_date: string;
  is_done: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  vehicle?: Vehicle;
}

// Dashboard KPI types
export interface DashboardKPIs {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  todayExpenses: number;
  weekExpenses: number;
  monthExpenses: number;
  estimatedProfit: number;
  totalVehicles: number;
  activeVehicles: number;
  inServiceVehicles: number;
  monthFuelCost: number;
  overdueReminders: number;
}

export interface VehicleProfitability {
  vehicle_id: string;
  vehicle: Vehicle;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'danger';
  title: string;
  message: string;
  vehicle_id?: string;
}
