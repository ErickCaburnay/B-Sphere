'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/client-utils';

export function ReportCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {trend && (
          <div className={cn(
            "text-xs mt-2",
            trend > 0 ? "text-green-500" : "text-red-500"
          )}>
            {trend > 0 ? "+" : ""}{trend}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );
} 