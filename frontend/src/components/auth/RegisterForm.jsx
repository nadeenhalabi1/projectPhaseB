import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import Input from '../ui/Input';
import Button from '../ui/Button';

/**
 * Registration form component
 * Registers new recruiters
 */
export default function RegisterForm() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const { error } = useUIStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'RECRUITER', // Default to RECRUITER
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data;

      await registerUser(userData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Show error toast with specific message
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        required
        error={errors.name?.message}
        {...register('name', {
          required: 'Name is required',
          minLength: {
            value: 2,
            message: 'Name must be at least 2 characters',
          },
        })}
      />

      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        required
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Create a password"
        required
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters',
          },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
            message:
              'Password must contain uppercase, lowercase, number, and special character',
          },
        })}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (value) =>
            value === password || 'Passwords do not match',
        })}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
