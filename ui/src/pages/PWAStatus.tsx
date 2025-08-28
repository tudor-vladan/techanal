import PWAStatus from '@/components/PWAStatus';

export default function PWAStatusPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">PWA Status</h1>
        <p className="text-muted-foreground">
          Monitorizare și configurare Progressive Web App
        </p>
      </div>
      
      <PWAStatus />
    </div>
  );
}
