import { PlannerSelection } from '@/components/planner-selection';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlannerSelection />
    </Suspense>
  );
}
