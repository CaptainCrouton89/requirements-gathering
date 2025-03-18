/**
 * Requirements gathering data types
 */

/**
 * A single project requirement
 */
export interface Requirement {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  tags: string[];
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Type of requirement
 */
export enum RequirementType {
  FUNCTIONAL = "functional",
  NON_FUNCTIONAL = "non-functional",
  TECHNICAL = "technical",
  USER_STORY = "user_story",
}

/**
 * Priority of requirement
 */
export enum RequirementPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Status of requirement
 */
export enum RequirementStatus {
  DRAFT = "draft",
  PROPOSED = "proposed",
  APPROVED = "approved",
  REJECTED = "rejected",
  IMPLEMENTED = "implemented",
  VERIFIED = "verified",
}

/**
 * Structure for creating a new requirement
 */
export interface NewRequirement {
  title: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  projectId?: string;
  tags?: string[];
}

/**
 * Project metadata
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Structure for creating a new project
 */
export interface NewProject {
  name: string;
  description: string;
}
