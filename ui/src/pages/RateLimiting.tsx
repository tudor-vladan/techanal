import RateLimitDashboard from '@/components/RateLimitDashboard';

export default function RateLimitingPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Rate Limiting</h1>
        <p className="text-muted-foreground">
          Monitorizare și configurare rate limiting pentru toate endpoint-urile
        </p>
      </div>
      
      <RateLimitDashboard />
    </div>
  );
}
