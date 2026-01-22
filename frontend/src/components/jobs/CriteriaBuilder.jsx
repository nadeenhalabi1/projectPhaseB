import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

/**
 * CriteriaBuilder component
 * Dynamic form for building job criteria with weight validation
 *
 * CRITICAL: Total weights must sum to exactly 100%
 */
export default function CriteriaBuilder({ control, register, watch, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'criteria',
  });

  // Watch all criteria weights to calculate total
  const watchedCriteria = watch('criteria') || [];
  const totalWeight = watchedCriteria.reduce((sum, criterion) => {
    const weight = parseFloat(criterion?.weight) || 0;
    return sum + weight;
  }, 0);

  const isValidWeight = Math.abs(totalWeight - 100) < 0.01;

  const addCriterion = () => {
    append({
      name: '',
      description: '',
      weight: 0,
      dataType: 'SCALE',
    });
  };

  const dataTypes = [
    { value: 'SCALE', label: 'Scale (0-10)' },
    { value: 'YEARS', label: 'Years of Experience' },
    { value: 'BOOLEAN', label: 'Yes/No' },
    { value: 'TEXT_MATCH', label: 'Text Match' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Evaluation Criteria
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Define criteria for candidate evaluation. Weights must total 100%.
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-lg font-semibold ${
            isValidWeight
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          Total: {totalWeight.toFixed(1)}%
        </div>
      </div>

      {/* Criteria list */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
          >
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                Criterion {index + 1}
              </h4>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Criterion Name"
                placeholder="e.g., Technical Skills"
                required
                error={errors.criteria?.[index]?.name?.message}
                {...register(`criteria.${index}.name`, {
                  required: 'Criterion name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register(`criteria.${index}.dataType`, {
                    required: 'Data type is required',
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                >
                  {dataTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.criteria?.[index]?.dataType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.criteria[index].dataType.message}
                  </p>
                )}
              </div>
            </div>

            <Input
              label="Description"
              placeholder="What should the AI look for?"
              required
              error={errors.criteria?.[index]?.description?.message}
              {...register(`criteria.${index}.description`, {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters',
                },
              })}
            />

            <Input
              label="Weight (%)"
              type="number"
              placeholder="e.g., 25"
              required
              error={errors.criteria?.[index]?.weight?.message}
              {...register(`criteria.${index}.weight`, {
                required: 'Weight is required',
                min: {
                  value: 0,
                  message: 'Weight must be at least 0',
                },
                max: {
                  value: 100,
                  message: 'Weight cannot exceed 100',
                },
                valueAsNumber: true,
              })}
            />
          </div>
        ))}
      </div>

      {/* Add criterion button */}
      <Button
        type="button"
        variant="secondary"
        onClick={addCriterion}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Criterion
      </Button>

      {/* Validation message */}
      {!isValidWeight && fields.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Total weight must equal 100%. Current total: {totalWeight.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
