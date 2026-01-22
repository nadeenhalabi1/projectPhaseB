import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateJob } from '../hooks/useJobs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import CriteriaBuilder from '../components/jobs/CriteriaBuilder';
import RequirementsBuilder from '../components/jobs/RequirementsBuilder';
import { getCurrencyOptions } from '../utils/currencyHelpers';

/**
 * Create new job page
 * Form with criteria builder
 */
export default function JobNew() {
  const navigate = useNavigate();
  const createJobMutation = useCreateJob();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      requirements: [],
      location: '',
      minSalary: '',
      maxSalary: '',
      currency: 'USD',
      criteria: [
        {
          name: '',
          description: '',
          weight: 0,
          dataType: 'SCALE',
        },
      ],
    },
  });

  // Watch criteria to validate total weight
  const watchedCriteria = watch('criteria') || [];
  const totalWeight = watchedCriteria.reduce((sum, criterion) => {
    const weight = parseFloat(criterion?.weight) || 0;
    return sum + weight;
  }, 0);
  const isValidWeight = Math.abs(totalWeight - 100) < 0.01;

  const onSubmit = async (data) => {
    // Validate weights before submission
    if (!isValidWeight) {
      return;
    }

    // Handle custom currency
    const jobData = { ...data };
    if (data.currency === 'CUSTOM' && data.customCurrency) {
      jobData.currency = data.customCurrency.toUpperCase();
      delete jobData.customCurrency;
    }

    try {
      const result = await createJobMutation.mutateAsync(jobData);
      // Navigate to the newly created job
      navigate(`/jobs/${result.job._id}`);
    } catch (error) {
      // Error handled by mutation
      console.error('Failed to create job:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the job details and define evaluation criteria
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Job Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Job Title"
              placeholder="e.g., Senior Software Engineer"
              required
              error={errors.title?.message}
              {...register('title', {
                required: 'Job title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
              })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                {...register('description', {
                  required: 'Job description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters',
                  },
                })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <Input
              label="Location"
              placeholder="e.g., Remote, New York, NY"
              {...register('location')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimum Salary"
                type="number"
                placeholder="e.g., 80000"
                error={errors.minSalary?.message}
                {...register('minSalary', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Salary cannot be negative' }
                })}
              />

              <Input
                label="Maximum Salary"
                type="number"
                placeholder="e.g., 120000"
                error={errors.maxSalary?.message}
                {...register('maxSalary', {
                  valueAsNumber: true,
                  validate: (value) => {
                    const minSalary = watch('minSalary');
                    if (minSalary && value && value < minSalary) {
                      return 'Maximum salary must be greater than minimum';
                    }
                    return true;
                  }
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Currency"
                value={watch('currency') || 'USD'}
                onChange={(value) => setValue('currency', value)}
                options={[
                  ...getCurrencyOptions(),
                  { value: 'CUSTOM', label: 'Custom Currency' }
                ]}
              />

              {watch('currency') === 'CUSTOM' && (
                <Input
                  label="Custom Currency Code"
                  placeholder="e.g., BTC"
                  error={errors.customCurrency?.message}
                  {...register('customCurrency', {
                    required: 'Custom currency is required'
                  })}
                />
              )}
            </div>
          </div>
        </Card>

        {/* Requirements builder */}
        <Card>
          <RequirementsBuilder control={control} />
        </Card>

        {/* Criteria builder */}
        <Card>
          <CriteriaBuilder
            control={control}
            register={register}
            watch={watch}
            errors={errors}
          />
        </Card>

        {/* Submit button */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/jobs')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || !isValidWeight}
          >
            {isSubmitting ? 'Creating...' : 'Create Job'}
          </Button>
        </div>
      </form>
    </div>
  );
}
