import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Fetch all logs for a user, sorted newest first
export const getLogs = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dtr_logs")
      .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Calculate total hours rendered on the backend
export const getTotalHours = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("dtr_logs")
      .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
      .collect();

    let totalMilliseconds = 0;
    for (const log of logs) {
      if (log.timeIn && log.timeOut) {
        const start = new Date(log.timeIn).getTime();
        const end = new Date(log.timeOut).getTime();
        totalMilliseconds += (end - start);
      }
    }
    // Return total in hours
    return totalMilliseconds / (1000 * 60 * 60);
  },
});

// Clock In Mutation (Prevents duplicate daily entries)
export const clockIn = mutation({
  args: { userId: v.string(), date: v.string(), timeIn: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dtr_logs")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    if (existing) throw new Error("You have already clocked in today.");

    return await ctx.db.insert("dtr_logs", {
      userId: args.userId,
      date: args.date,
      timeIn: args.timeIn,
    });
  },
});

// Clock Out Mutation
export const clockOut = mutation({
  args: { id: v.id("dtr_logs"), timeOut: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { timeOut: args.timeOut });
  },
});

// Manual Entry Mutation
export const addManualEntry = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    timeIn: v.string(),
    timeOut: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dtr_logs")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    if (existing) throw new Error("An entry for this date already exists.");

    return await ctx.db.insert("dtr_logs", {
      userId: args.userId,
      date: args.date,
      timeIn: args.timeIn,
      timeOut: args.timeOut,
    });
  },
});

export const updateEntry = mutation({
  args: {
    id: v.id("dtr_logs"),
    timeIn: v.string(),
    timeOut: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      timeIn: args.timeIn,
      timeOut: args.timeOut,
    });
  },
});

export const deleteEntry = mutation({
  args: { id: v.id("dtr_logs") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});