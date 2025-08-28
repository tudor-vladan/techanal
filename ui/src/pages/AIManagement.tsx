import { AIManagementDashboard } from '@/components/AIManagementDashboard';
import HelpSystem from '@/components/HelpSystem';
// import { Link } from 'react-router-dom';

export default function AIManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">AI Management</h1>
            <p className="text-muted-foreground">Gestionează provider-ii AI și configurează serviciile</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Removed external Model Management button; use Models tab inside dashboard */}
            <HelpSystem feature="ai-management" variant="outline" size="sm" />
          </div>
        </div>
        <AIManagementDashboard />
      </div>
    </div>
  );
}
