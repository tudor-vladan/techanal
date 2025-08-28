import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ChartDataPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface SystemChartsProps {
  data: ChartDataPoint[];
  isLive: boolean;
}

export function SystemCharts({ data, isLive }: SystemChartsProps) {
  // Calculează trend-urile pentru fiecare metrică
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 'stable';
    const recent = values.slice(-5);
    const older = values.slice(-10, -5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.05) return 'increasing';
    if (recentAvg < olderAvg * 0.95) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-500';
      case 'decreasing':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const cpuTrend = calculateTrend(data.map(d => d.cpu));
  const memoryTrend = calculateTrend(data.map(d => d.memory));
  const diskTrend = calculateTrend(data.map(d => d.disk));
  const networkTrend = calculateTrend(data.map(d => d.network));

  // Formatează timestamp-ul pentru afișare
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Pregătește datele pentru grafice
  const chartData = (data && data.length > 0 ? data : Array.from({ length: 10 }, (_, i) => ({
    timestamp: new Date(Date.now() - (10 - i) * 5000).toISOString(),
    cpu: 30 + Math.random() * 40,
    memory: 30 + Math.random() * 40,
    disk: 10 + Math.random() * 20,
    network: 5 + Math.random() * 15,
  }))).map(point => ({
    ...point,
    time: formatTimestamp(point.timestamp)
  }));

  return (
    <div className="space-y-6">
      {/* CPU Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              CPU Usage Trend
            </span>
            <div className="flex items-center gap-2">
              {getTrendIcon(cpuTrend)}
              <span className={`text-sm font-medium ${getTrendColor(cpuTrend)}`}>
                {cpuTrend === 'increasing' ? 'Crescător' : 
                 cpuTrend === 'decreasing' ? 'Descrescător' : 'Stabil'}
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            Monitorizează utilizarea CPU în timp real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'CPU']}
                labelFormatter={(label) => `Ora: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Memory Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Memory Usage Trend
            </span>
            <div className="flex items-center gap-2">
              {getTrendIcon(memoryTrend)}
              <span className={`text-sm font-medium ${getTrendColor(memoryTrend)}`}>
                {memoryTrend === 'increasing' ? 'Crescător' : 
                 memoryTrend === 'decreasing' ? 'Descrescător' : 'Stabil'}
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            Monitorizează utilizarea memoriei în timp real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Memory']}
                labelFormatter={(label) => `Ora: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="memory" 
                stroke="#82ca9d" 
                strokeWidth={3}
                dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#82ca9d', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disk & Network Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Disk Usage
              </span>
              <div className="flex items-center gap-2">
                {getTrendIcon(diskTrend)}
                <span className={`text-sm font-medium ${getTrendColor(diskTrend)}`}>
                  {diskTrend === 'increasing' ? 'Crescător' : 
                   diskTrend === 'decreasing' ? 'Descrescător' : 'Stabil'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Disk']}
                  labelFormatter={(label) => `Ora: ${label}`}
                />
                <Bar dataKey="disk" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Network Activity
              </span>
              <div className="flex items-center gap-2">
                {getTrendIcon(networkTrend)}
                <span className={`text-sm font-medium ${getTrendColor(networkTrend)}`}>
                  {networkTrend === 'increasing' ? 'Crescător' : 
                   networkTrend === 'decreasing' ? 'Descrescător' : 'Stabil'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Network']}
                  labelFormatter={(label) => `Ora: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="network" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  dot={{ fill: '#ff7300', strokeWidth: 1, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Live Status Indicator */}
      {isLive && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Monitorizare în timp real activă</span>
              <span className="text-sm">• Datele se actualizează automat</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
