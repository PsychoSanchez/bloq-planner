'use client';

import { useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ProjectTypeBadge } from '@/components/project-type-badge';
import { PriorityBadge } from '@/components/priority-badge';

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
    dependencies: project.dependencies?.join(', ') || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track which field is currently being edited
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          dependencies: formData.dependencies ? formData.dependencies.split(',').map((dep) => dep.trim()) : [],
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

  // Function to conditionally render an editable field
  const renderEditableField = (fieldName: string, displayValue: React.ReactNode, editComponent: React.ReactNode) => {
    const isActive = activeField === fieldName;

    if (isActive) {
      return (
        <div className="relative">
          {editComponent}
          <div className="absolute right-0 top-0 flex gap-1 mt-1">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setActiveField(null)}>
              <CheckIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => {
                // Revert changes for this field
                setFormData((prev) => ({
                  ...prev,
                  [fieldName]:
                    fieldName === 'dependencies'
                      ? project.dependencies?.join(', ') || ''
                      : project[fieldName as keyof Project] || '',
                }));
                setActiveField(null);
              }}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="min-h-[24px] p-1 rounded hover:bg-muted/50 cursor-pointer"
        onClick={() => setActiveField(fieldName)}
      >
        {displayValue}
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              <XIcon className="h-4 w-4 mr-1" />
              Cancel
            </Button>

            {renderEditableField(
              'name',
              <h1 className="text-2xl font-bold">{project.name}</h1>,
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="text-2xl font-bold border-dashed focus:border-solid"
                onBlur={() => setActiveField(null)}
                autoFocus
                required
              />,
            )}

            <ProjectTypeBadge type={project.type} />
          </div>
          <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
            <CheckIcon className="h-4 w-4 mr-1" />
            Save All Changes
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {renderEditableField(
                  'description',
                  formData.description ? (
                    <p>{formData.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No description provided</p>
                  ),
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="min-h-[100px] border-dashed focus:border-solid"
                    placeholder="Add a description..."
                    onBlur={() => setActiveField(null)}
                    autoFocus
                  />,
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dependencies</CardTitle>
              </CardHeader>
              <CardContent>
                {renderEditableField(
                  'dependencies',
                  formData.dependencies ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {formData.dependencies.split(',').map((dep, index) => (
                        <li key={index}>{dep.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">No dependencies</p>
                  ),
                  <div className="space-y-2">
                    <Label htmlFor="dependencies">Comma-separated list of dependencies</Label>
                    <Textarea
                      id="dependencies"
                      name="dependencies"
                      value={formData.dependencies}
                      onChange={handleChange}
                      className="border-dashed focus:border-solid"
                      placeholder="e.g. Infrastructure setup, Authentication, API"
                      onBlur={() => setActiveField(null)}
                      autoFocus
                    />
                  </div>,
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Priority</p>
                  {renderEditableField(
                    'priority',
                    <div>
                      <PriorityBadge priority={formData.priority || 'medium'} />
                    </div>,
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => {
                        handleSelectChange('priority', value);
                        setActiveField(null);
                      }}
                      open={true}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>,
                  )}
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Team</p>
                  {renderEditableField(
                    'teamId',
                    <p>{formData.teamId || 'No team assigned'}</p>,
                    <Input
                      id="teamId"
                      name="teamId"
                      value={formData.teamId}
                      onChange={handleChange}
                      className="border-dashed focus:border-solid"
                      placeholder="Team name"
                      onBlur={() => setActiveField(null)}
                      autoFocus
                    />,
                  )}
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Lead</p>
                  {renderEditableField(
                    'leadId',
                    <p>{formData.leadId || 'No lead assigned'}</p>,
                    <Input
                      id="leadId"
                      name="leadId"
                      value={formData.leadId}
                      onChange={handleChange}
                      className="border-dashed focus:border-solid"
                      placeholder="Project lead"
                      onBlur={() => setActiveField(null)}
                      autoFocus
                    />,
                  )}
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Area</p>
                  {renderEditableField(
                    'area',
                    <p>{formData.area || 'Not specified'}</p>,
                    <Input
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="border-dashed focus:border-solid"
                      placeholder="Project area"
                      onBlur={() => setActiveField(null)}
                      autoFocus
                    />,
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </>
  );
}
