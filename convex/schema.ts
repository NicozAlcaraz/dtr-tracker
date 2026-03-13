import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dtr_logs: defineTable({
    userId: v.string(),
    date: v.string(),   // Format: YYYY-MM-DD
    timeIn: v.string(), // ISO String
    timeOut: v.optional(v.string()), // ISO String
  }).index("by_user_and_date", ["userId", "date"]),
});