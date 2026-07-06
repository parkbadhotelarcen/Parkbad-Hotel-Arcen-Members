export type GuestStatus = "concept" | "active" | "ended" | "deleted";
export type EmployeeRole = "reception" | "manager" | "admin";

export type Guest = {
  id: string;
  guest_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: GuestStatus;
  current_level: string;
  total_visits: number;
  activation_token: string | null;
  public_token: string | null;
  control_code: string | null;
  created_at: string;
  activated_at: string | null;
  deleted_at: string | null;
};

export type Level = {
  id: string;
  name: string;
  min_visits: number;
  max_visits: number | null;
  color: string;
  icon: string;
};

export type Reward = {
  id: string;
  visit_count: number;
  reward_name: string;
  reward_description: string | null;
  active: boolean;
};

export type Employee = {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  active: boolean;
  created_at: string;
};

export type Visit = {
  id: string;
  guest_id: string;
  visit_date: string;
  reservation_number: string | null;
  room_number: string | null;
  added_by_employee_id: string | null;
  created_at: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  condition_type: string;
  condition_value: string;
};
