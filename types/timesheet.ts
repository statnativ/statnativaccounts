export type ResourceName = "Amit" | "Abhilash";

export interface TimesheetEntry {
  id: string;
  date: Date;
  resourceName: ResourceName;
  hoursWorked: number;
  hourlyRate: number;
  projectName?: string;
  clientName?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimesheetFormData {
  date: Date;
  resourceName: ResourceName;
  hoursWorked: number;
  hourlyRate: number;
  projectName?: string;
  clientName?: string;
  description?: string;
}

export interface TimesheetSummary {
  resourceName: ResourceName;
  totalHours: number;
  totalAmount: number;
  entries: TimesheetEntry[];
}
