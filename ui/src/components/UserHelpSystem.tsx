import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Upload, 
  Play, 
  Brain, 
  Target,
  BarChart3,
  Settings,
  Eye,
  Download,
  Share2,
  RefreshCw,
  Activity,
  Pause,
  Zap,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen,
  Video,
  PlayCircle
} from 'lucide-react';

interface UserHelpProps {
  type: 'tooltip' | 'inline' | 'wizard';
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  videoUrl?: string;
  children: React.ReactNode;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  action: string;
  tip?: string;
}

interface UserHelpSystemProps {
  feature: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

// Help contextual pentru butoanele importante
export function UserHelp({ type, title, description, steps, tips, videoUrl, children }: UserHelpProps) {
  const [showWizard, setShowWizard] = useState(false);

  if (type === 'tooltip') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{title}</h4>
              <p className="text-xs text-muted-foreground">{description}</p>
              {tips && (
                <div className="pt-2">
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Lightbulb className="w-3 h-3" />
                    <span className="font-medium">Tip:</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{tips[0]}</p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (type === 'inline') {
    return (
      <div className="group relative">
        {children}
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 bg-blue-100 hover:bg-blue-200 text-blue-600"
            onClick={() => setShowWizard(true)}
          >
            <HelpCircle className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'wizard') {
    return (
      <>
        {children}
        <Dialog open={showWizard} onOpenChange={setShowWizard}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">{description}</p>
              </div>

              {steps && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Pași de urmat:</h4>
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              )}

              {tips && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-medium text-sm">Sfaturi utile:</span>
                  </div>
                  <ul className="space-y-1">
                    {tips.map((tip, index) => (
                      <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {videoUrl && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Video className="w-4 h-4" />
                    <span className="font-medium text-sm">Tutorial video:</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open(videoUrl, '_blank')}
                  >
                    <PlayCircle className="w-4 h-4" />
                    Vezi tutorial-ul
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <>{children}</>;
}

// Help system pentru funcționalități specifice
export function UserHelpSystem({ feature, variant = 'outline', size = 'sm', className = '' }: UserHelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const helpContent = {
    'trading-analysis': {
      title: 'Cum să analizezi un chart de trading',
      description: 'Ghidare pas cu pas pentru analiza AI a chart-urilor de trading',
      steps: [
        'Încarcă o imagine cu chart-ul de trading (PNG, JPG)',
        'Scrie ce vrei să analizezi în câmpul de prompt',
        'Apasă "Analizează" și așteaptă rezultatele AI',
        'Citește recomandările și interpretează semnalele'
      ],
      tips: [
        'Folosește imagini clare și de calitate bună',
        'Scrie prompt-uri specifice pentru rezultate mai bune',
        'Salvează analizele utile pentru referință viitoare'
      ]
    },
    'ai-management': {
      title: 'Cum să configurezi AI-ul',
      description: 'Configurarea și management-ul provider-ilor AI',
      steps: [
        'Adaugă API keys pentru OpenAI, Anthropic sau Ollama',
        'Configurează parametrii pentru fiecare provider',
        'Testează conectivitatea și funcționalitatea',
        'Monitorizează performanța și costurile'
      ],
      tips: [
        'Verifică API keys înainte de salvare',
        'Testează provider-ii înainte de utilizare',
        'Monitorizează costurile pentru OpenAI și Anthropic'
      ]
    },
    'model-management': {
      title: 'Cum să faci fine-tuning la modelele AI',
      description: 'Training și optimizarea modelelor AI',
      steps: [
        'Selectează modelul pe care vrei să îl îmbunătățești',
        'Configurează parametrii de training',
        'Lansează procesul de fine-tuning',
        'Monitorizează progresul și rezultatele'
      ],
      tips: [
        'Începe cu un număr mic de epochs',
        'Monitorizează overfitting-ul',
        'Testează modelele pe date reale'
      ]
    }
  };

  const content = helpContent[feature as keyof typeof helpContent];

  if (!content) {
    return (
      <Button variant="outline" size="sm" className="text-muted-foreground">
        <HelpCircle className="w-4 h-4 mr-2" />
        Help
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <HelpCircle className="w-4 h-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {content.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">{content.description}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Pași de urmat:</h4>
            {content.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <Lightbulb className="w-4 h-4" />
              <span className="font-medium text-sm">Sfaturi utile:</span>
            </div>
            <ul className="space-y-1">
              {content.tips.map((tip, index) => (
                <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserHelpSystem;
