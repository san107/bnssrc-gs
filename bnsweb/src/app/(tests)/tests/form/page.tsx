'use client';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@mui/material';
import { FormEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const registerSchema = z
  .object({
    email: z.string().min(1, '이메일을 입력해주세요.').email('이메일 형식을 입력해주세요.'),
    userId: z
      .string()
      .min(1, '아이디를 입력해주세요.')
      .regex(/^[a-z0-9]{4,30}$/, '영문 소문자 또는 영문+숫자 조합 4~30자리를 입력해주세요.'),
    password: z
      .string()
      .min(1, '비밀번호를 입력해주세요.')
      .regex(
        /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/,
        '영문+숫자+특수문자(! @ # $ % & * ?) 조합 8~15자리를 입력해주세요.'
      ),
    passwordCheck: z.string().min(1, '비밀번호를 다시 입력해주세요.'),
    recommendationCode: z
      .string()
      .regex(/^[a-z]{0,}$/, '추천코드는 소문자로 입력 가능합니다')
      .optional(),
    agree: z.string(),
  })
  .refine((data) => data.password === data.passwordCheck, {
    path: ['passwordCheck'],
    message: '비밀번호가 일치하지 않습니다.',
  });

type RegisterSchemaType = z.infer<typeof registerSchema>; // 타입 추론 자동

export default function FormIndex() {
  return (
    <Body
      css={css`
        & hr.test {
          margin: 5px 0px;
          border: 3px solid pink;
        }
      `}
    >
      <FormTest1 />
      <hr className='test' />
      <FormTest2 />
      <hr className='test' />
      <App3 />
      <hr className='test' />
      <FormTest3 />
      <hr className='test' />
      <Form4 />
    </Body>
  );
}

const FormTest3 = () => {
  return <div>폼테스트 3</div>;
};

// ract-hook-form
function Form4() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      date: null,
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))} noValidate>
      <Controller
        control={control}
        name='date'
        rules={{ required: true }}
        render={({ field }) => {
          return (
            <Input
              value={field.value || ''}
              inputRef={field.ref}
              onChange={(date) => {
                console.log('date', date);
                field.onChange(date);
              }}
            />
          );
        }}
      />
    </form>
  );
}
const FormTest1 = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });
  //const { onChange, onBlur, name, ref } = register("email");
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    //
    console.log('E', e, e.currentTarget, e.target);
    const data = new FormData(e.currentTarget);
    const values = Object.fromEntries(data.entries());
    console.log(values, data);

    e.preventDefault();
  };
  const handleSubmit2 = (e: FormEvent) => {
    console.log('--------------------', e);
    handleSubmit((data) => {
      console.log('---data..', data);
    })(e);
  };
  return (
    <div>
      폼 테스트1
      <Button
        onClick={() => {
          console.log('safeparse', registerSchema.safeParse({ password: '' }));
        }}
      >
        검증 테스트.{' '}
      </Button>
      <form onSubmit={handleSubmit2}>
        <input {...register('userId')} style={{ border: '1px solid #ccc' }} />
        <input {...register('email')} style={{ border: '1px solid #ccc' }} />
        <button type='submit'>서브밋(react-hook)</button>
        <hr />
        {errors.agree?.message}
        {errors.password?.message}
        emsg userid : {errors.userId?.message}
        emsg email : {errors.email?.message}
        {errors.email?.type}
        <hr />
      </form>
      <form onSubmit={onSubmit}>
        <input name='username' style={{ border: '1px solid #ccc' }} />
        <button type='submit'>서브밋</button>
      </form>
    </div>
  );
};
const Body = styled.div`
  & input {
    border: 1px solid #ccc;
    padding: 0 4px;
    margin: 0 4px;
  }
  & button {
    padding: 0 4px;
    margin: 0 4px;
    border: 1px solid #bbb;
  }
`;
const FormTest2 = () => {
  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });
  //const { onChange, onBlur, name, ref } = register("email");
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    //
    console.log('E', e, e.currentTarget, e.target);
    const data = new FormData(e.currentTarget);
    const values = Object.fromEntries(data.entries());
    console.log(values, data);

    e.preventDefault();
  };
  return (
    <div>
      폼 테스트2
      <Button
        onClick={() => {
          console.log('safeparse', registerSchema.safeParse({ password: '' }));
        }}
      >
        검증 테스트.{' '}
      </Button>
      <form
        onSubmit={form.handleSubmit((data) => {
          console.log('data..', data);
        })}
      >
        <input {...form.register('userId')} style={{ border: '1px solid #ccc' }} />
        <input {...form.register('email')} style={{ border: '1px solid #ccc' }} />
        <button type='submit'>서브밋(react-hook)</button>
        <hr />
        {form.formState.errors.agree?.message}
        {form.formState.errors.password?.message}
        emsg userid : {form.formState.errors.userId?.message}
        emsg email : {form.formState.errors.email?.message}
        {form.formState.errors.email?.type}
        <hr />
      </form>
      <form onSubmit={onSubmit}>
        <input name='username' style={{ border: '1px solid #ccc' }} />
        <button type='submit'>서브밋</button>
      </form>
    </div>
  );
};

const App3 = () => {
  const { register, setValue } = useForm();

  return (
    <form>
      <div>App3 </div>
      <input {...register('firstName')} />
      <button type='button' onClick={() => setValue('firstName', 'Bill')}>
        setValue
      </button>
      <button
        type='button'
        onClick={() =>
          setValue('lastName', 'firstName', {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      >
        setValue options
      </button>
    </form>
  );
};
