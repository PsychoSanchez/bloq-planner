export function generateAssigneeKey(assigneeId: string, weekNumber: number): string {
  return `${assigneeId}::${weekNumber}`;
}

export function parseAssigneeKey(id: string) {
  const [assigneeId = 'UNKNOWN', weekNumber] = id.split('::');
  return {
    assigneeId,
    weekNumber: parseInt(weekNumber || '-1'),
  };
}
