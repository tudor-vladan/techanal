import SecurityMonitoringDashboard from '@/components/SecurityMonitoringDashboard';

export default function SecurityMonitoringPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Security Monitoring</h1>
        <p className="text-muted-foreground">
          Monitorizare unificată a tuturor aspectelor de securitate
        </p>
      </div>
      
      <SecurityMonitoringDashboard />
    </div>
  );
}
