import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Requirements builder component
 * Allows adding/removing requirement items
 */
export default function RequirementsBuilder({ control }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requirements',
  });

  const handleAddRequirement = () => {
    append('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
          <p className="text-sm text-gray-500">
            List key requirements and qualifications for this role
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddRequirement}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Requirement
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">
            No requirements added yet. Click "Add Requirement" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`Requirement ${index + 1}`}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                  {...control.register(`requirements.${index}`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
