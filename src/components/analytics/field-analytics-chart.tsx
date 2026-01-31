'use client'

import { Cell, Pie, PieChart, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

interface FieldAnalyticsChartProps {
  field: {
    fieldId: string
    fieldLabel: string
    fieldTextT: string
    totalAnswers: number
    answerBreakdown: Array<{
      value: string
      count: number
      percentage: number
    }>
  }
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function FieldAnalyticsChart({ field }: FieldAnalyticsChartProps) {
  const { fieldLabel, fieldTextT, totalAnswers, answerBreakdown } = field

  if (!answerBreakdown || answerBreakdown.length === 0) {
    return (
      <div className="flex items-center justify-center h-50 text-muted-foreground text-sm">
        No responses yet
      </div>
    )
  }

  const chartConfig: ChartConfig = answerBreakdown.reduce((acc, item, index) => {
    acc[item.value] = {
      label: item.value,
      color: COLORS[index % COLORS.length],
    }
    return acc
  }, {} as ChartConfig)

  // Use pie chart for multiple choice, bar chart for ratings
  if (fieldTextT === 'rating') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{fieldLabel}</h4>
          <span className="text-xs text-muted-foreground">{totalAnswers} responses</span>
        </div>
        <ChartContainer config={chartConfig} className="h-45 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={answerBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="value"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                {answerBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    )
  }

  // Pie chart for multiple choice / dropdown
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{fieldLabel}</h4>
        <span className="text-xs text-muted-foreground">{totalAnswers} responses</span>
      </div>
      <ChartContainer config={chartConfig} className="h-55 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={answerBreakdown}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="count"
              nameKey="value"
              strokeWidth={0}
            >
              {answerBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <p className="text-sm font-medium">{data.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.count} ({data.percentage}%)
                    </p>
                  </div>
                )
              }}
            />
            <Legend
              content={({ payload }) => (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                  {payload?.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-muted-foreground">
                        {String(entry.value).length > 15
                          ? String(entry.value).substring(0, 15) + '...'
                          : entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
