import { LegoPlanner } from '@/components/lego-planner';
import { getSampleData } from '@/lib/sample-data';

export default function HomePage() {
  const initialData = getSampleData(2024, 2);
  return <LegoPlanner initialData={initialData} />;
}
