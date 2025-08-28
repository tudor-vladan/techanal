import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Download, 
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SystemReport {
  id: string;
  name: string;
  type: 'performance' | 'processes' | 'alerts' | 'comprehensive';
  format: 'pdf' | 'csv' | 'json';
  dateRange: 'last-hour' | 'last-6-hours' | 'last-24-hours' | 'last-week' | 'custom';
  customStart?: string;
  customEnd?: string;
  includeCharts: boolean;
  includeAlerts: boolean;
  includeProcesses: boolean;
}

export function SystemReports() {
  const [reportConfig, setReportConfig] = useState<SystemReport>({
    id: '',
    name: 'System Report',
    type: 'comprehensive',
    format: 'pdf',
    dateRange: 'last-24-hours',
    includeCharts: true,
    includeAlerts: true,
    includeProcesses: true
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulează generarea raportului
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aici ar trebui să generezi raportul real
      console.log('Generating report with config:', reportConfig);
      
      // Simulează download-ul
      const blob = new Blob(['Report content'], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-report-${new Date().toISOString().split('T')[0]}.${reportConfig.format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case 'last-hour':
        return 'Ultima oră';
      case 'last-6-hours':
        return 'Ultimele 6 ore';
      case 'last-24-hours':
        return 'Ultimele 24 ore';
      case 'last-week':
        return 'Ultima săptămână';
      case 'custom':
        return 'Personalizat';
      default:
        return range;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'performance':
        return 'Performanță';
      case 'processes':
        return 'Procese';
      case 'alerts':
        return 'Alert-uri';
      case 'comprehensive':
        return 'Comprehensiv';
      default:
        return type;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'PDF';
      case 'csv':
        return 'CSV';
      case 'json':
        return 'JSON';
      default:
        return format;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configurare Raport
          </CardTitle>
          <CardDescription>
            Configurează și generează rapoarte de sistem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Nume Raport</Label>
              <Input
                id="report-name"
                value={reportConfig.name}
                onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Introdu numele raportului"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-type">Tip Raport</Label>
              <Select
                value={reportConfig.type}
                onValueChange={(value: any) => setReportConfig(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performanță</SelectItem>
                  <SelectItem value="processes">Procese</SelectItem>
                  <SelectItem value="alerts">Alert-uri</SelectItem>
                  <SelectItem value="comprehensive">Comprehensiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Format and Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-format">Format Export</Label>
              <Select
                value={reportConfig.format}
                onValueChange={(value: any) => setReportConfig(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-range">Interval Temporal</Label>
              <Select
                value={reportConfig.dateRange}
                onValueChange={(value: any) => setReportConfig(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-hour">Ultima oră</SelectItem>
                  <SelectItem value="last-6-hours">Ultimele 6 ore</SelectItem>
                  <SelectItem value="last-24-hours">Ultimele 24 ore</SelectItem>
                  <SelectItem value="last-week">Ultima săptămână</SelectItem>
                  <SelectItem value="custom">Personalizat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range */}
          {reportConfig.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Data Început</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={reportConfig.customStart || ''}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, customStart: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">Data Sfârșit</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={reportConfig.customEnd || ''}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, customEnd: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Content Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Conținut Raport</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-charts"
                  checked={reportConfig.includeCharts}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="include-charts" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Grafice
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-alerts"
                  checked={reportConfig.includeAlerts}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeAlerts: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="include-alerts" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alert-uri
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-processes"
                  checked={reportConfig.includeProcesses}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeProcesses: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="include-processes" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Procese
                </Label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={generateReport}
              disabled={isGenerating}
              className="flex items-center gap-2 min-w-[200px]"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Se generează...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generează Raport
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Previzualizare Raport
          </CardTitle>
          <CardDescription>
            Configurația curentă a raportului
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Tip</div>
              <div className="text-lg font-semibold">{getReportTypeLabel(reportConfig.type)}</div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Format</div>
              <div className="text-lg font-semibold">{getFormatLabel(reportConfig.format)}</div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Interval</div>
              <div className="text-lg font-semibold">{getDateRangeLabel(reportConfig.dateRange)}</div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Grafice</div>
              <div className="text-lg font-semibold">{reportConfig.includeCharts ? 'Da' : 'Nu'}</div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Alert-uri</div>
              <div className="text-lg font-semibold">{reportConfig.includeAlerts ? 'Da' : 'Nu'}</div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Procese</div>
              <div className="text-lg font-semibold">{reportConfig.includeProcesses ? 'Da' : 'Nu'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
