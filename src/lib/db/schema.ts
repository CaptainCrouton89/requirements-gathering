import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  RequirementPriority,
  RequirementStatus,
  RequirementType,
} from "../types.js";

/**
 * Projects table schema
 */
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * Requirements table schema
 */
export const requirements = sqliteTable("requirements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().$type<RequirementType>(),
  priority: text("priority").notNull().$type<RequirementPriority>(),
  status: text("status").notNull().$type<RequirementStatus>(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * RequirementTags table schema (many-to-many)
 */
export const requirementTags = sqliteTable(
  "requirement_tags",
  {
    requirementId: text("requirement_id")
      .notNull()
      .references(() => requirements.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.requirementId, table.tag] }),
    };
  }
);
