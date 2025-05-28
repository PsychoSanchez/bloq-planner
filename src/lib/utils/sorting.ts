// Helper function to get role sort priority
export const getRoleSortPriority = (role?: string): number => {
  const rolePriority: Record<string, number> = {
    product_management: 1,
    engineering: 2,
    qa: 3,
    design: 4,
    analytics: 5,
    data_science: 6,
    operations: 7,
  };

  return rolePriority[role || ''] || 999; // Unknown roles go to the end
};
