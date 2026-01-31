'use client'

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

interface FormPerformanceChartProps {
  data: Array<{
    id: string
    name: string
    responses: number
    percentage: number
    isPublished: boolean
  }>
}

const chartConfig: ChartConfig = {
  responses: {
    label: 'Responses',
    color: 'hsl(var(--chart-2))',
  },
}

export function FormPerformanceChart({ data }: FormPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-75 text-muted-foreground text-sm">
        No form data available
      </div>
    )
  }

  // Limit to top 10 forms
  const chartData = data.slice(0, 10).map(item => ({
    ...item,
    name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
  }))

  return (
    <ChartContainer config={chartConfig} className="h-75 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            width={120}
          />
          <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
          <Bar
            dataKey="responses"
            fill="hsl(var(--chart-2))"
            radius={[0, 4, 4, 0]}
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
