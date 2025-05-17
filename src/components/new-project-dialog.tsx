import { useState } from 'react';
import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusIcon, X, CalendarIcon, Users, Target, Link2Icon } from 'lucide-react';

interface NewProjectDialogProps {
  onProjectCreate?: (project: Partial<Project>) => void;
}

export function NewProjectDialog({ onProjectCreate }: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [projectType, setProjectType] = useState<Project['type']>('regular');
  const [projectDescription, setProjectDescription] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);
  const [newMilestone, setNewMilestone] = useState('');

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([...milestones, newMilestone.trim()]);
      setNewMilestone('');
    }
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!projectName) return;

    const newProject: Partial<Project> = {
      name: projectName,
      type: projectType,
    };

    onProjectCreate?.(newProject);

    // Reset form and close dialog
    setProjectName('');
    setProjectSummary('');
    setProjectType('regular');
    setProjectDescription('');
    setMilestones([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8">
          <PlusIcon className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-sm font-medium">New project</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Project name */}
          <div className="space-y-1">
            <Input
              placeholder="Project name"
              className="h-9 text-sm"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          {/* Project summary */}
          <div className="space-y-1">
            <Input
              placeholder="Add a short summary..."
              className="h-8 text-xs"
              value={projectSummary}
              onChange={(e) => setProjectSummary(e.target.value)}
            />
          </div>

          {/* Project options */}
          <div className="flex flex-wrap gap-2 text-xs">
            <Select defaultValue="backlog">
              <SelectTrigger className="h-7 text-xs px-2 py-0 w-auto">
                <SelectValue placeholder="Backlog" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog" className="text-xs">
                  Backlog
                </SelectItem>
                <SelectItem value="todo" className="text-xs">
                  To Do
                </SelectItem>
                <SelectItem value="inprogress" className="text-xs">
                  In Progress
                </SelectItem>
                <SelectItem value="done" className="text-xs">
                  Done
                </SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="nopriority">
              <SelectTrigger className="h-7 text-xs px-2 py-0 w-auto">
                <SelectValue placeholder="No priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nopriority" className="text-xs">
                  No priority
                </SelectItem>
                <SelectItem value="low" className="text-xs">
                  Low
                </SelectItem>
                <SelectItem value="medium" className="text-xs">
                  Medium
                </SelectItem>
                <SelectItem value="high" className="text-xs">
                  High
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-0">
              <Users className="h-3 w-3 mr-1" />
              <span>Lead</span>
            </Button>

            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-0">
              <Users className="h-3 w-3 mr-1" />
              <span>Members</span>
            </Button>

            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-0">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>Start</span>
            </Button>

            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-0">
              <Target className="h-3 w-3 mr-1" />
              <span>Target</span>
            </Button>

            <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-0">
              <Link2Icon className="h-3 w-3 mr-1" />
              <span>Dependencies</span>
            </Button>
          </div>

          {/* Project description */}
          <div>
            <Textarea
              placeholder="Write a description, a project brief, or collect ideas..."
              className="resize-none text-xs min-h-[100px]"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>

          {/* Project type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Project Type</label>
            <Select value={projectType} onValueChange={(value) => setProjectType(value as Project['type'])}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular" className="text-xs">
                  Regular
                </SelectItem>
                <SelectItem value="tech-debt" className="text-xs">
                  Tech Debt
                </SelectItem>
                <SelectItem value="team-event" className="text-xs">
                  Team Event
                </SelectItem>
                <SelectItem value="spillover" className="text-xs">
                  Spillover
                </SelectItem>
                <SelectItem value="blocked" className="text-xs">
                  Blocked
                </SelectItem>
                <SelectItem value="hack" className="text-xs">
                  Hack
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium">Milestones</label>
            </div>

            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 text-xs p-1.5 border rounded-sm">{milestone}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleRemoveMilestone(index)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Add milestone..."
                  className="h-7 text-xs"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') handleAddMilestone();
                  }}
                />
                <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={handleAddMilestone}>
                  <PlusIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={handleSubmit} disabled={!projectName}>
            Create project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
