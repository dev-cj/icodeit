import React from 'react';
import { login } from '../utils';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '@/common/Forms/Input';
import Button from '@/common/Button';
import { loginLocal } from '@/shared/auth/storage';
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();

  const {
    register,
    formState: { errors },
    getValues,
    trigger,
  } = useForm({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onLoginClick = async () => {
    const values = getValues();
    const result = await trigger();

    if (!result) {
      toast.error('Details not valid');
    }
    const { success, data, message } = await login(
      values.email,
      values.password
    );

    if (success && data) {
      loginLocal(data.token);
      toast.success('Login successfull.');
      router.push('/playgrounds');
    } else {
      toast.error(message || 'Error logging in. Try again later.');
    }

    return;
  };

  return (
    <div className='flex-1 flex-col flex h-full w-full items-center justify-center'>
      <div className=' max-w-2xl w-full h-96 flex items-center flex-col rounded border p-8 gap-4'>
        <div className='text-2xl font-semibold'>Login</div>
        <div className='flex-1 h-full items-center justify-evenly flex flex-col'>
          <div className='flex flex-col space-y-6'>
            <div className='flex flex-col gap-1'>
              <div className='font-semibold'>Email</div>
              <Input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value:
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    message: 'Please enter a valid email',
                  },
                })}
                placeholder='Email'
                error={errors.email}
                errorMsg={errors.email && errors.email.message}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <div className='font-semibold'>Password</div>
              <Input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Minimum length should be 6',
                  },
                })}
                placeholder='Password'
                error={errors.password}
                errorMsg={errors.password && errors.password.message}
                type='password'
              />
            </div>
          </div>
        </div>
        <div>
          <Button onClick={onLoginClick}>Login</Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
