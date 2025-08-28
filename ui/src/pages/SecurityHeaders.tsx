import SecurityHeadersDashboard from '@/components/SecurityHeadersDashboard';

export default function SecurityHeadersPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Security Headers</h1>
        <p className="text-muted-foreground">
          Testează și monitorizează security headers pentru aplicații web
        </p>
      </div>
      
      <SecurityHeadersDashboard />
    </div>
  );
}
