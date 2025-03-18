export interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "proposed" | "approved" | "rejected" | "implemented";
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  contactInfo?: string;
  requirements: string[]; // Requirement IDs this stakeholder is associated with
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  requirements: string[]; // Requirement IDs associated with this project
  stakeholders: string[]; // Stakeholder IDs associated with this project
}

export interface RequirementUpdate {
  requirementId: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  updatedBy: string;
}

export interface RequirementsStore {
  requirements: Record<string, Requirement>;
  stakeholders: Record<string, Stakeholder>;
  projects: Record<string, Project>;
  updates: RequirementUpdate[];
  save(): Promise<void>;
  load(): Promise<void>;
}
