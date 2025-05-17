import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
      <h1 className="text-4xl font-bold">Project Not Found</h1>
      <p className="text-muted-foreground max-w-md">
        The project you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>
    </div>
  );
}
