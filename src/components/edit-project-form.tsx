'use client';

import { useState } from 'react';
import { CheckIcon, XIcon, CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/lib/types';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { ColorSelector } from './color-selector';
import { DEFAULT_PROJECT_COLOR_NAME } from '@/lib/project-colors';

interface EditProjectFormProps {
  project: Project;
  onCancel: () => void;
}

export function EditProjectForm({ project, onCancel }: EditProjectFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    priority: project.priority || 'medium',
    teamId: project.teamId || '',
    leadId: project.leadId || '',
    area: project.area || '',
    dependencies: project.dependencies?.map((dep) => dep.team).join(', ') || '',
    color: project.color || DEFAULT_PROJECT_COLOR_NAME,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, color: color }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dependencies: formData.dependencies
            ? formData.dependencies.split(',').map((dep) => ({ team: dep.trim() }))
            : [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      router.refresh();
      onCancel();
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Button type="button" variant="outline" size="sm" onClick={onCancel} className="text-xs px-2 py-1 h-auto">
              <XIcon className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={isSubmitting}
            className="text-xs px-2 py-1 h-auto"
          >
            <CheckIcon className="h-3 w-3 mr-1" />
            Save Changes
          </Button>
        </div>

        <div className="flex items-baseline space-x-2">
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="md:text-xl text-xl font-bold flex-1 border-none focus:outline-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 rounded-none bg-input/0 dark:bg-input/0"
            placeholder="Project Name"
            required
          />
          <span className="text-xl font-bold text-muted-foreground">/</span>
          <span className="md:text-xl text-xl font-bold w-auto border-none focus:outline-none h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 rounded-none bg-transparent text-muted-foreground">
            {project.slug}
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs text-muted-foreground font-medium">PROPERTIES</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">Type:</span>
              <ProjectTypeBadge type={project.type} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">Priority:</span>
              <Select
                name="priority"
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger className="border-none p-1 h-auto focus:outline-none focus:ring-0 hover:bg-muted/50 rounded-xs shadow-none text-sm bg-input/0 dark:bg-input/0">
                  <SelectValue placeholder="Set priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">Color:</span>
              <ColorSelector selectedColorName={formData.color} onColorChange={handleColorChange} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">Lead:</span>
              <Input
                id="leadId"
                name="leadId"
                value={formData.leadId}
                onChange={handleChange}
                placeholder="Assign lead"
                className="border-0 border-b-0 focus:border-b focus:border-primary focus:outline-none p-1 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-muted/50 rounded-xs shadow-none bg-input/0 dark:bg-input/0"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">Team:</span>
              <Input
                id="teamId"
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                placeholder="Assign team"
                className="border-0 border-b-0 focus:border-b focus:border-primary focus:outline-none p-1 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-muted/50 rounded-xs shadow-none bg-input/0 dark:bg-input/0"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">Area:</span>
              <Input
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Specify area"
                className="border-0 border-b-0 focus:border-b focus:border-primary focus:outline-none p-1 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-muted/50 rounded-xs shadow-none bg-input/0 dark:bg-input/0"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="description" className="text-xs text-muted-foreground font-medium">
            DESCRIPTION
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-1 border border-transparent hover:border-muted focus:border-input focus:outline-none min-h-[60px] text-sm focus-visible:ring-1 focus-visible:ring-offset-0 shadow-none rounded-sm bg-input/0 dark:bg-input/0"
            placeholder="Add a more detailed description..."
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="dependencies" className="text-xs text-muted-foreground font-medium">
            DEPENDENCIES
          </Label>
          <Textarea
            id="dependencies"
            name="dependencies"
            value={formData.dependencies}
            onChange={handleChange}
            className="w-full p-1 border border-transparent hover:border-muted focus:border-input focus:outline-none min-h-[40px] text-sm focus-visible:ring-1 focus-visible:ring-offset-0 shadow-none rounded-sm bg-input/0 dark:bg-input/0"
            placeholder="e.g. Team A, Team B"
          />
        </div>

        <div className="pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3 opacity-70" />
            <span>Created: {project.createdAt ? format(new Date(project.createdAt), 'PP') : 'Unknown'}</span>
          </div>
        </div>
      </form>
    </>
  );
}
