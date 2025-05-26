#!/usr/bin/env node

/**
 * Utility script to recalculate ROI for all existing projects
 * This ensures that any projects created before ROI auto-calculation
 * will have their ROI values properly calculated.
 *
 * Usage: node scripts/recalculate-roi.js
 */

import mongoose from 'mongoose';

// MongoDB connection string - update this to match your environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lego-planner';

// Project schema (simplified for this script)
const projectSchema = new mongoose.Schema(
  {
    name: String,
    cost: Number,
    impact: Number,
    roi: Number,
  },
  { timestamps: true },
);

const Project = mongoose.model('Project', projectSchema);

async function recalculateROI() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    console.log('Fetching all projects...');
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const project of projects) {
      const { cost, impact } = project;

      // Calculate ROI
      let newROI = 0;
      if (cost && cost > 0 && impact !== undefined) {
        newROI = impact / cost;
      }

      // Update if ROI is different or missing
      if (project.roi !== newROI) {
        await Project.findByIdAndUpdate(project._id, { roi: newROI });
        console.log(`Updated project "${project.name}": cost=${cost}, impact=${impact}, roi=${newROI.toFixed(2)}x`);
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`\nROI recalculation completed:`);
    console.log(`- Updated: ${updatedCount} projects`);
    console.log(`- Skipped: ${skippedCount} projects (already correct)`);
    console.log(`- Total: ${projects.length} projects`);
  } catch (error) {
    console.error('Error recalculating ROI:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
recalculateROI();
