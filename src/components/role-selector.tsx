import { ROLE_OPTIONS } from '@/lib/constants';
import {
  InlineSelectTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface RoleSelectorProps {
  type?: 'inline' | 'dropdown';
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  readonly?: boolean;
}

/**
 * RoleSelector component for selecting team member roles
 *
 * @example
 * ```tsx
 * const [selectedRole, setSelectedRole] = useState('');
 *
 * <RoleSelector
 *   value={selectedRole}
 *   onSelect={setSelectedRole}
 *   placeholder="Choose a role"
 *   type="dropdown"
 * />
 * ```
 */
export const RoleSelector = ({
  value,
  onSelect,
  type = 'dropdown',
  placeholder = 'Select role',
  readonly = false,
}: RoleSelectorProps) => {
  const SelectComponent = type === 'inline' ? InlineSelectTrigger : SelectTrigger;

  return (
    <Select value={value} onValueChange={onSelect} disabled={readonly}>
      <SelectComponent className="px-2" id="role">
        <SelectValue placeholder={placeholder} />
      </SelectComponent>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Role</SelectLabel>
          {ROLE_OPTIONS.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              <role.icon className="h-4 w-4" />
              <span>{role.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
