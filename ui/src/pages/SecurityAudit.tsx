import SecurityAuditLog from '@/components/SecurityAuditLog';

export default function SecurityAuditPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Security Audit</h1>
        <p className="text-muted-foreground">
          Monitorizare completă a evenimentelor de securitate și acces
        </p>
      </div>
      
      <SecurityAuditLog />
    </div>
  );
}
