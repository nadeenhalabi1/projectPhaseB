import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useJob, useUpdateJob } from '../hooks/useJobs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { CenteredSpinner } from '../components/ui/Spinner';
import CriteriaBuilder from '../components/jobs/CriteriaBuilder';
import RequirementsBuilder from '../components/jobs/RequirementsBuilder';
import { getCurrencyOptions } from '../utils/currencyHelpers';

/**
 * Edit existing job page
 * Form with criteria builder, pre-populated with existing data
 */
export default function JobEdit() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useJob(jobId);
  const updateJobMutation = useUpdateJob();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
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
      criteria: [],
    },
  });

  // Load job data into form when available
  useEffect(() => {
    if (data?.job) {
      const job = data.job;

      // Check if currency is custom (not in predefined list)
      const predefinedCurrencies = getCurrencyOptions().map(c => c.value);
      const isCustomCurrency = job.currency && !predefinedCurrencies.includes(job.currency);

      reset({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || [],
        location: job.location || '',
        minSalary: job.minSalary || '',
        maxSalary: job.maxSalary || '',
        currency: isCustomCurrency ? 'CUSTOM' : (job.currency || 'USD'),
        customCurrency: isCustomCurrency ? job.currency : '',
        criteria: job.criteria || [],
      });
    }
  }, [data, reset]);

  // Watch criteria to validate total weight
  const watchedCriteria = watch('criteria') || [];
  const totalWeight = watchedCriteria.reduce((sum, criterion) => {
    const weight = parseFloat(criterion?.weight) || 0;
    return sum + weight;
  }, 0);
  const isValidWeight = Math.abs(totalWeight - 100) < 0.01;

  const onSubmit = async (formData) => {
    // Validate weights before submission
    if (!isValidWeight) {
      return;
    }

    // Handle custom currency
    const jobData = { ...formData };
    if (formData.currency === 'CUSTOM' && formData.customCurrency) {
      jobData.currency = formData.customCurrency.toUpperCase();
      delete jobData.customCurrency;
    }

    try {
      await updateJobMutation.mutateAsync({ jobId, updates: jobData });
      // Navigate back to job detail
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      // Error handled by mutation
      console.error('Failed to update job:', error);
    }
  };

  if (isLoading) {
    return <CenteredSpinner message="Loading job..." />;
  }

  if (error || !data?.job) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load job. Please try again.</p>
          <Button
            variant="secondary"
            onClick={() => navigate('/jobs')}
            className="mt-4"
          >
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update job details and evaluation criteria
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
            onClick={() => navigate(`/jobs/${jobId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || !isValidWeight}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
