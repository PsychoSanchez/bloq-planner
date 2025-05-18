'use client';

import { LegoPlanner } from '@/components/lego-planner';
import { getPlanner } from '@/lib/planner-api';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Planner } from '@/lib/types';

export default function LegoPlannerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [plannerData, setPlannerData] = useState<Planner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const plannerId = params.id as string;

  useEffect(() => {
    const loadPlanner = async () => {
      try {
        setIsLoading(true);
        const data = await getPlanner(plannerId);
        setPlannerData(data);
      } catch (error) {
        console.error('Failed to load planner:', error);
        toast({
          title: 'Error',
          description: 'Failed to load planner. It may have been deleted.',
          variant: 'destructive',
        });
        // Redirect back to planner selection after a delay
        setTimeout(() => router.push('/planner/lego'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanner();
  }, [plannerId, router, toast]);

  const handleBackClick = () => {
    router.push('/planner/lego');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading planner data...</p>
        </div>
      </div>
    );
  }

  if (!plannerData) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Planner not found</p>
          <Button onClick={handleBackClick}>Return to Planner Selection</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Lego Planner ({plannerId.substring(0, 8)})</h1>
      </div>
      <LegoPlanner initialData={plannerData} />
    </div>
  );
}
