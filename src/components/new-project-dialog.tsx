'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CpuIcon,
  JapaneseYenIcon,
  PlusIcon,
  ShieldCheckIcon,
  SignalHighIcon,
  SignalLowIcon,
  SignalMediumIcon,
  TelescopeIcon,
  TriangleAlert,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function NewProjectDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'regular',
    area: '',
    priority: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setOpen(false);
        // Reset form
        setFormData({
          slug: '',
          name: '',
          type: 'regular',
          area: '',
          priority: 'medium',
        });
        // Refresh the projects page to show the new project
        router.refresh();
      } else {
        console.error('Failed to create project:', await response.text());
        toast({
          title: 'Error',
          description: 'Failed to create project. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while creating the project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Add a new project to your planner.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                autoFocus
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Project Types</SelectLabel>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="tech-debt">Tech Debt</SelectItem>
                    <SelectItem value="team-event">Team Event</SelectItem>
                    <SelectItem value="spillover">Spillover</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="hack">Hack</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area">Area</Label>
              <Select value={formData.area} onValueChange={(value) => setFormData({ ...formData, area: value })}>
                <SelectTrigger id="area">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Project Area</SelectLabel>
                    <SelectItem value="discoverability">
                      <TelescopeIcon />
                      <span>Discoverability</span>
                    </SelectItem>
                    <SelectItem value="monetization">
                      <JapaneseYenIcon />
                      <span>Monetization</span>
                    </SelectItem>
                    <SelectItem value="quality">
                      <ShieldCheckIcon />
                      <span>Quality</span>
                    </SelectItem>
                    <SelectItem value="tech">
                      <CpuIcon />
                      <span>Tech</span>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <SignalLowIcon className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Low</span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <SignalMediumIcon className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-green-500">Medium</span>
                  </SelectItem>
                  <SelectItem value="high">
                    <SignalHighIcon className="mr-2 h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-500">High</span>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <TriangleAlert className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-red-500">Urgent</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
