export interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  status: "proposed" | "approved" | "rejected" | "implemented";
  createdAt: string;
  updatedAt: string;
}

export interface RequirementUpdate {
  id: string;
  requirementId: string;
  updatedBy: string;
  updatedFields: Partial<Requirement>;
  timestamp: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  contactInfo?: string;
  requirements: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  requirements: string[];
  stakeholders: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RequirementsStore {
  requirements: Record<string, Requirement>;
  stakeholders: Record<string, Stakeholder>;
  projects: Record<string, Project>;
  updates: RequirementUpdate[];
  save(): Promise<void>;
  load(): Promise<void>;
}
