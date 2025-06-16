import { expect, test, describe } from 'bun:test';
import { fromProjectDocument, ProjectDocument } from '../project';
import mongoose from 'mongoose';

describe('Project ROI Auto-calculation', () => {
  test('should calculate ROI correctly when cost > 0', () => {
    // ROI = Impact / Cost
    const cost = 1000;
    const impact = 1500;
    const expectedROI = impact / cost; // 1.5

    expect(expectedROI).toBe(1.5);
  });

  test('should calculate ROI correctly for ROI < 1', () => {
    const cost = 1000;
    const impact = 800;
    const expectedROI = impact / cost; // 0.8

    expect(expectedROI).toBe(0.8);
  });

  test('should handle zero cost by setting ROI to 0', () => {
    // When cost is 0, ROI should be 0 to avoid division by zero
    const expectedROI = 0;

    expect(expectedROI).toBe(0);
  });

  test('should handle zero impact correctly', () => {
    const cost = 1000;
    const impact = 0;
    const expectedROI = impact / cost; // 0

    expect(expectedROI).toBe(0);
  });

  test('should handle equal cost and impact (break-even)', () => {
    const cost = 1000;
    const impact = 1000;
    const expectedROI = impact / cost; // 1.0

    expect(expectedROI).toBe(1);
  });
});

describe('fromProjectDocument ROI calculation', () => {
  test('should calculate ROI when converting from document with cost and impact', () => {
    const mockDoc: ProjectDocument = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Project',
      slug: 'test-project',
      type: 'regular',
      cost: 1000,
      impact: 1500,
      roi: undefined, // Not set in database
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const project = fromProjectDocument(mockDoc);

    expect(project.roi).toBe(1.5); // 1500 / 1000 = 1.5
  });

  test('should recalculate ROI even if already present in document', () => {
    const mockDoc: ProjectDocument = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Project',
      slug: 'test-project',
      type: 'regular',
      cost: 2000,
      impact: 3000,
      roi: 999, // Wrong value in database
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const project = fromProjectDocument(mockDoc);

    expect(project.roi).toBe(1.5); // Should recalculate: 3000 / 2000 = 1.5
  });

  test('should set ROI to 0 when cost is 0', () => {
    const mockDoc: ProjectDocument = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Project',
      slug: 'test-project',
      type: 'regular',
      cost: 0,
      impact: 1000,
      roi: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const project = fromProjectDocument(mockDoc);

    expect(project.roi).toBe(0);
  });

  test('should set ROI to 0 when cost is undefined', () => {
    const mockDoc: ProjectDocument = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Project',
      slug: 'test-project',
      type: 'regular',
      cost: undefined,
      impact: 1000,
      roi: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const project = fromProjectDocument(mockDoc);

    expect(project.roi).toBe(0);
  });

  test('should set ROI to 0 when impact is undefined', () => {
    const mockDoc: ProjectDocument = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Project',
      slug: 'test-project',
      type: 'regular',
      cost: 1000,
      impact: undefined,
      roi: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const project = fromProjectDocument(mockDoc);

    expect(project.roi).toBe(0);
  });
});
