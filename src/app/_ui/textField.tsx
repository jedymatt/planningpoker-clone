'use client';

import { cn } from '@/lib/utils';
import { forwardRef, HTMLProps, useState } from 'react';

interface TextFieldProps extends HTMLProps<HTMLInputElement> {}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ onChange, className, ...props }, ref) => {
    const [hasValue, setHasValue] = useState(!!props.value);

    return (
      <label className="relative">
        <input
          ref={ref}
          {...props}
          type="text"
          onChange={(e) => {
            setHasValue(!!e.target.value);
            onChange?.(e);
          }}
          className={cn('peer p-2', className)}
        />

        {props.label && (
          <span
            className={cn(
              'absolute inset-y-0 left-2 pointer-events-none bg-inherit transition-all duration-200',
              hasValue
                ? 'bg-white text-xs -translate-y-[120%] px-1 h-fit'
                : 'peer-focus:bg-white peer-focus:text-xs peer-focus:-translate-y-[120%] peer-focus:px-1 peer-focus:h-fit',
            )}
          >
            {props.label}
          </span>
        )}
      </label>
    );
  },
);

TextField.displayName = 'TextField';
