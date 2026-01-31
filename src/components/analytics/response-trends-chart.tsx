'use client'

import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

interface ResponseTrendsChartProps {
  data: Array<{
    date: string
    fullDate: string
    responses: number
  }>
}

const chartConfig: ChartConfig = {
  responses: {
    label: 'Responses',
    color: 'hsl(var(--chart-1))',
  },
}

export function ResponseTrendsChart({ data }: ResponseTrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-75 text-muted-foreground text-sm">
        No response data available
      </div>
    )
  }

  const maxResponses = Math.max(...data.map(d => d.responses), 1)

  return (
    <ChartContainer config={chartConfig} className="h-75 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            tickMargin={8}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            tickMargin={8}
            domain={[0, Math.ceil(maxResponses * 1.1)]}
            allowDecimals={false}
          />
          <Tooltip
            content={<ChartTooltipContent indicator="line" />}
            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="responses"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="url(#responseGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
