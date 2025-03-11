import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Agent } from '../types/agent';
import { BarChart2, Clock, Activity, Cpu } from 'lucide-react';

interface AgentMetricsProps {
  agent: Agent;
}

export function AgentMetrics({ agent }: AgentMetricsProps) {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!chartRef.current || !agent.metrics) return;

    const width = chartRef.current.clientWidth;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Clear previous content
    d3.select(chartRef.current).selectAll('*').remove();

    // Sample data for the last 7 days
    const data = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
      tasks: Math.floor(Math.random() * 50),
      memory: Math.floor(Math.random() * 1024),
      success: Math.random() * 100
    }));

    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.tasks) || 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create the SVG container
    const svg = d3.select(chartRef.current)
      .attr('viewBox', [0, 0, width, height]);

    // Add the line path
    const line = d3.line<any>()
      .x(d => x(d.date))
      .y(d => y(d.tasks))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'var(--primary)')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add the area
    const area = d3.area<any>()
      .x(d => x(d.date))
      .y0(y(0))
      .y1(d => y(d.tasks))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'var(--primary)')
      .attr('fill-opacity', 0.1)
      .attr('d', area);

    // Add the x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(7).tickSizeOuter(0))
      .call(g => g.select('.domain').remove());

    // Add the y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
      .call(g => g.select('.domain').remove());
  }, [agent]);

  if (!agent.metrics) return null;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-input bg-background/50">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Tasks Completed</div>
            <BarChart2 className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{agent.metrics.tasksCompleted}</div>
          <div className="mt-2 text-sm text-muted-foreground">Last 7 days</div>
        </div>

        <div className="p-4 rounded-lg border border-input bg-background/50">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Response Time</div>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{agent.metrics.averageResponseTime}s</div>
          <div className="mt-2 text-sm text-muted-foreground">Average</div>
        </div>

        <div className="p-4 rounded-lg border border-input bg-background/50">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Success Rate</div>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{agent.metrics.successRate}%</div>
          <div className="mt-2 text-sm text-muted-foreground">All time</div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="rounded-lg border border-input bg-background/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium">Performance History</div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Last 7 days</span>
            <BarChart2 className="h-4 w-4" />
          </div>
        </div>
        <svg
          ref={chartRef}
          className="w-full"
          style={{ height: '200px' }}
        />
      </div>

      {/* Resource Usage */}
      <div className="rounded-lg border border-input bg-background/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium">Resource Usage</div>
          <Cpu className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Memory</span>
              <span className="text-sm">{agent.metrics.memoryUsage}MB</span>
            </div>
            <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(agent.metrics.memoryUsage / agent.config!.memory) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">CPU Usage</span>
              <span className="text-sm">45%</span>
            </div>
            <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: '45%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 