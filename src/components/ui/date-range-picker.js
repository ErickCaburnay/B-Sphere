'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/client-utils';
import { Button } from '@/components/ui/button';

export function DateRangePicker({ value, onChange, className }) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Button
        variant="outline"
        className={cn(
          'w-[300px] justify-start text-left font-normal',
          !value && 'text-muted-foreground'
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value?.from ? (
          value.to ? (
            <>
              {format(value.from, 'LLL dd, y')} -{' '}
              {format(value.to, 'LLL dd, y')}
            </>
          ) : (
            format(value.from, 'LLL dd, y')
          )
        ) : (
          <span>Pick a date range</span>
        )}
      </Button>
    </div>
  );
} 