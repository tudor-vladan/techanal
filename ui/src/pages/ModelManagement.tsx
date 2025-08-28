import React from 'react';
import { ModelManagementDashboard } from '@/components/ModelManagementDashboard';
import HelpSystem from '@/components/HelpSystem';

export default function ModelManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Model Management</h1>
            <p className="text-muted-foreground">Gestionează modelele AI și configurează fine-tuning</p>
          </div>
          <HelpSystem feature="model-management" variant="outline" size="sm" />
        </div>
        <ModelManagementDashboard />
      </div>
    </div>
  );
}
