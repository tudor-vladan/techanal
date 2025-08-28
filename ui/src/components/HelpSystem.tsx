import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HelpCircle, 
  BookOpen, 
  Zap,
  Lightbulb,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface HelpContent {
  title: string;
  description: string;
  features: string[];
  steps: Array<{
    step: number;
    title: string;
    description: string;
    tips?: string[];
  }>;
  examples: Array<{
    title: string;
    description: string;
    code?: string;
  }>;
  tips: string[];
  commonIssues: Array<{
    issue: string;
    solution: string;
  }>;
}

interface HelpSystemProps {
  feature: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const helpContent: Record<string, HelpContent> = {
  'trading-analysis': {
    title: 'Trading Analysis Help',
    description: 'Învață cum să analizezi screenshot-uri de trading cu AI',
    features: [
      'Upload screenshot-uri cu drag & drop',
      'Editor de prompt-uri personalizate',
      'Analiză AI cu recomandări de trading',
      'Istoric al analizelor anterioare',
      'Compararea rezultatelor'
    ],
    steps: [
      {
        step: 1,
        title: 'Încarcă Screenshot',
        description: 'Selectează sau trage o imagine de trading în zona de upload',
        tips: ['Formate acceptate: PNG, JPG, JPEG', 'Dimensiune maximă: 10MB', 'Dimensiuni minime: 100x100px']
      },
      {
        step: 2,
        title: 'Configurează Prompt-ul',
        description: 'Scrie criteriile de analiză sau selectează un template predefinit',
        tips: ['Folosește prompt-uri clare și specifice', 'Mentionează timeframe-ul dorit', 'Specifică indicatorii tehnici preferați']
      },
      {
        step: 3,
        title: 'Lansează Analiza',
        description: 'Apasă butonul "Analizează" și așteaptă rezultatele AI',
        tips: ['Analiza durează 2-5 secunde', 'Poți monitoriza progresul în timp real', 'Rezultatele sunt salvate automat']
      },
      {
        step: 4,
        title: 'Interpretează Rezultatele',
        description: 'Analizează recomandările AI și indicatorii tehnici',
        tips: ['Verifică nivelul de încredere', 'Uită-te la support/resistance', 'Analizează pattern-urile identificate']
      }
    ],
    examples: [
      {
        title: 'Prompt pentru Analiză Tehnică',
        description: 'Analizează acest screenshot și identifică pattern-urile tehnice, nivelurile de support/resistance, și generează o recomandare de trading cu stop-loss și take-profit.',
        code: 'Analizează acest screenshot și identifică pattern-urile tehnice, nivelurile de support/resistance, și generează o recomandare de trading cu stop-loss și take-profit.'
      },
      {
        title: 'Prompt pentru Analiză Fundamentală',
        description: 'Analizează acest chart în contextul pieței și oferă o evaluare a sentimentului și volatilității.',
        code: 'Analizează acest chart în contextul pieței și oferă o evaluare a sentimentului și volatilității.'
      }
    ],
    tips: [
      'Folosește prompt-uri specifice pentru rezultate mai bune',
      'Salvează prompt-urile utile pentru utilizare viitoare',
      'Compară analizele anterioare pentru a vedea progresul',
      'Folosește overlay-ul pentru a vedea analiza pe chart',
      'Verifică istoricul pentru a înțelege pattern-urile'
    ],
    commonIssues: [
      {
        issue: 'Imaginea nu se încarcă',
        solution: 'Verifică formatul fișierului (PNG, JPG, JPEG) și dimensiunea (max 10MB)'
      },
      {
        issue: 'Analiza eșuează',
        solution: 'Încearcă cu o imagine mai clară și un prompt mai specific'
      },
      {
        issue: 'Rezultatele nu sunt clare',
        solution: 'Refinează prompt-ul pentru a fi mai specific despre ce vrei să analizezi'
      }
    ]
  },
  'ai-management': {
    title: 'AI Management Help',
    description: 'Învață cum să gestionezi provider-ii AI și să configurezi serviciile',
    features: [
      'Multi-provider AI support (OpenAI, Anthropic, Ollama)',
      'Health monitoring și performance tracking',
      'Configuration management pentru API keys',
      'Testing și validation automată',
      'Cost tracking și usage analytics'
    ],
    steps: [
      {
        step: 1,
        title: 'Configurează Provider-ii',
        description: 'Adaugă API keys și configurează parametrii pentru fiecare provider AI',
        tips: ['Verifică API keys înainte de salvare', 'Configurează timeout-urile corect', 'Testează conectivitatea']
      },
      {
        step: 2,
        title: 'Monitorizează Status-ul',
        description: 'Verifică health-ul și performanța provider-ilor în timp real',
        tips: ['Urmărește response time-ul', 'Monitorizează rate limits', 'Verifică error rates']
      },
      {
        step: 3,
        title: 'Testează Funcționalitatea',
        description: 'Rulează teste automate pentru a valida provider-ii',
        tips: ['Testează înainte de production', 'Verifică accuracy-ul răspunsurilor', 'Monitorizează costurile']
      },
      {
        step: 4,
        title: 'Optimizează Performanța',
        description: 'Ajustează parametrii pentru performanță optimă',
        tips: ['Optimizează batch sizes', 'Ajustează timeout-urile', 'Monitorizează memory usage']
      }
    ],
    examples: [
      {
        title: 'OpenAI Configuration',
        description: 'Configurează OpenAI cu API key, model selection și temperature.',
        code: 'API_KEY=sk-...\nMODEL=gpt-4-vision-preview\nTEMPERATURE=0.7\nMAX_TOKENS=1000'
      },
      {
        title: 'Ollama Local Setup',
        description: 'Configurează Ollama pentru procesare locală cu modelul Llama.',
        code: 'BASE_URL=http://localhost:11434\nMODEL=llama3.1:8b\nTEMPERATURE=0.8'
      }
    ],
    tips: [
      'Mereu testează provider-ii înainte de production',
      'Monitorizează costurile pentru OpenAI și Anthropic',
      'Folosește Ollama pentru date sensibile',
      'Configurează fallback-uri pentru provider-ii indisponibili',
      'Verifică rate limits și timeout-urile'
    ],
    commonIssues: [
      {
        issue: 'API key invalid',
        solution: 'Verifică API key-ul și permisiunile în dashboard-ul provider-ului'
      },
      {
        issue: 'Provider indisponibil',
        solution: 'Verifică conectivitatea internet și status-ul provider-ului'
      },
      {
        issue: 'Rate limit exceeded',
        solution: 'Reduce frecvența request-urilor sau upgrade la un plan superior'
      }
    ]
  },
  'model-management': {
    title: 'Model Management Help',
    description: 'Învață cum să gestionezi modelele AI și să faci fine-tuning',
    features: [
      'Fine-tuning automat pentru modelele AI',
      'Versioning și management al modelelor',
      'Performance monitoring și drift detection',
      'Training configuration și hyperparameters',
      'Model comparison și activation'
    ],
    steps: [
      {
        step: 1,
        title: 'Selectează Modelul',
        description: 'Alege modelul pe care vrei să faci fine-tuning',
        tips: ['Verifică performanța actuală', 'Analizează training data-ul disponibil', 'Evaluează nevoile de îmbunătățire']
      },
      {
        step: 2,
        title: 'Configurează Training-ul',
        description: 'Setează hyperparameterii și configurația de training',
        tips: ['Ajustează learning rate-ul', 'Setează numărul de epochs', 'Configurează batch size-ul']
      },
      {
        step: 3,
        title: 'Lansează Fine-tuning',
        description: 'Pornește procesul de training și monitorizează progresul',
        tips: ['Monitorizează loss-ul în timp real', 'Verifică validation accuracy', 'Urmărește training time-ul']
      },
      {
        step: 4,
        title: 'Evaluează Rezultatele',
        description: 'Compară performanța modelului nou cu versiunea anterioară',
        tips: ['Testează pe date de validare', 'Compară accuracy-ul', 'Verifică response time-ul']
      }
    ],
    examples: [
      {
        title: 'Fine-tuning Configuration',
        description: 'Configurație optimă pentru fine-tuning cu Llama 3.1.',
        code: 'EPOCHS=100\nLEARNING_RATE=0.001\nBATCH_SIZE=64\nVALIDATION_SPLIT=0.2'
      },
      {
        title: 'Performance Comparison',
        description: 'Compară versiunile modelului pentru a alege cea mai bună.',
        code: 'Compare accuracy, response time, and pattern recognition across versions'
      }
    ],
    tips: [
      'Începe cu un număr mic de epochs și mărește gradual',
      'Monitorizează overfitting-ul pe validation data',
      'Salvează checkpoint-uri în timpul training-ului',
      'Testează modelele pe date reale înainte de deployment',
      'Documentează toate experimentele și rezultatele'
    ],
    commonIssues: [
      {
        issue: 'Training eșuează',
        solution: 'Verifică memory-ul disponibil și reduce batch size-ul'
      },
      {
        issue: 'Overfitting',
        solution: 'Reduce numărul de epochs și mărește validation split-ul'
      },
      {
        issue: 'Performanța nu se îmbunătățește',
        solution: 'Verifică calitatea training data-ului și ajustează hyperparameterii'
      }
    ]
  },
  'system-monitor': {
    title: 'System Monitor Help',
    description: 'Învață cum să monitorizezi performanța sistemului în timp real',
    features: [
      'Real-time system monitoring',
      'Performance metrics și analytics',
      'Resource usage tracking',
      'Automated health checks',
      'Performance optimization tools'
    ],
    steps: [
      {
        step: 1,
        title: 'Monitorizează Status-ul',
        description: 'Verifică health-ul general al sistemului și serviciilor',
        tips: ['Urmărește uptime-ul', 'Verifică response time-urile', 'Monitorizează error rates']
      },
      {
        step: 2,
        title: 'Analizează Performanța',
        description: 'Examinează metricile de performanță și identifică bottleneck-urile',
        tips: ['Urmărește CPU și memory usage', 'Verifică network latency', 'Analizează database performance']
      },
      {
        step: 3,
        title: 'Optimizează Sistemul',
        description: 'Aplică optimizări bazate pe metricile identificate',
        tips: ['Optimizează cache-ul', 'Ajustează timeout-urile', 'Scalează resursele']
      },
      {
        step: 4,
        title: 'Configurează Alerting-ul',
        description: 'Setează notificări pentru problemele critice',
        tips: ['Configurează threshold-urile', 'Setează escalation rules', 'Testează notificările']
      }
    ],
    examples: [
      {
        title: 'Performance Dashboard',
        description: 'Dashboard complet cu toate metricile de performanță.',
        code: 'Monitor CPU, Memory, Network, Database, and AI Engine performance'
      },
      {
        title: 'Health Check Configuration',
        description: 'Configurează health checks automate pentru servicii.',
        code: 'HEALTH_CHECK_INTERVAL=10s\nTIMEOUT=5s\nRETRY_COUNT=3'
      }
    ],
    tips: [
      'Monitorizează sistemul în timp real pentru probleme',
      'Setează alerting-ul pentru metricile critice',
      'Analizează trend-urile de performanță pe termen lung',
      'Optimizează sistemul bazat pe metricile identificate',
      'Documentează toate optimizările și rezultatele'
    ],
    commonIssues: [
      {
        issue: 'High CPU usage',
        solution: 'Verifică procesele active și optimizează codul sau scalează resursele'
      },
      {
        issue: 'Memory leaks',
        solution: 'Analizează memory usage patterns și implementează garbage collection'
      },
      {
        issue: 'Slow response times',
        solution: 'Optimizează database queries, implementează caching, și scalează serviciile'
      }
    ]
  },
  'learning-analytics': {
    title: 'Learning Analytics Help',
    description: 'Învață cum să folosești sistemul de learning și analytics',
    features: [
      'Continuous learning pentru modelele AI',
      'User behavior analytics',
      'Backtesting engine pentru strategii',
      'Feedback system pentru îmbunătățiri',
      'Performance tracking și optimization'
    ],
    steps: [
      {
        step: 1,
        title: 'Explorează Dashboard-ul',
        description: 'Familiarizează-te cu toate secțiunile de learning analytics',
        tips: ['Verifică toate tab-urile disponibile', 'Explorează metricile de performanță', 'Uită-te la trend-urile de learning']
      },
      {
        step: 2,
        title: 'Analizează Comportamentul',
        description: 'Examinează user analytics pentru a înțelege pattern-urile',
        tips: ['Urmărește user engagement-ul', 'Analizează feature usage', 'Identifică pain points']
      },
      {
        step: 3,
        title: 'Testează Strategiile',
        description: 'Folosește backtesting engine-ul pentru a valida strategiile',
        tips: ['Începe cu strategii simple', 'Testează pe date istorice', 'Analizează rezultatele']
      },
      {
        step: 4,
        title: 'Îmbunătățește Modelele',
        description: 'Folosește feedback-ul pentru a optimiza modelele AI',
        tips: ['Colectează feedback structurat', 'Analizează accuracy-ul', 'Implementează îmbunătățiri']
      }
    ],
    examples: [
      {
        title: 'Backtesting Strategy',
        description: 'Testează o strategie de trading pe date istorice.',
        code: 'Select strategy → Set parameters → Run backtest → Analyze results'
      },
      {
        title: 'User Feedback Analysis',
        description: 'Analizează feedback-ul utilizatorilor pentru îmbunătățiri.',
        code: 'Review feedback → Identify patterns → Prioritize improvements → Implement changes'
      }
    ],
    tips: [
      'Folosește backtesting-ul pentru a valida strategiile înainte de production',
      'Colectează feedback constant de la utilizatori',
      'Monitorizează accuracy-ul modelelor AI în timp real',
      'Implementează îmbunătățiri iterative bazate pe date',
      'Documentează toate experimentele și rezultatele'
    ],
    commonIssues: [
      {
        issue: 'Backtesting eșuează',
        solution: 'Verifică datele istorice și parametrii strategiei'
      },
      {
        issue: 'Feedback insuficient',
        solution: 'Implementează sistem de colectare automată și incentive pentru utilizatori'
      },
      {
        issue: 'Modelele nu se îmbunătățesc',
        solution: 'Verifică calitatea training data-ului și algoritmii de learning'
      }
    ]
  }
};

export function HelpSystem({ feature, variant = 'default', size = 'default', className = '' }: HelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const content = helpContent[feature];

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {content.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Despre această funcționalitate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{content.description}</p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Caracteristici principale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {content.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cum să folosești</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.steps.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{step.title}</h4>
                      <p className="text-muted-foreground mb-2">{step.description}</p>
                      {step.tips && (
                        <div className="space-y-1">
                          {step.tips.map((tip, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Lightbulb className="w-3 h-3 text-yellow-500" />
                              <span className="text-muted-foreground">{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exemple de utilizare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.examples.map((example, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{example.title}</h4>
                    <p className="text-muted-foreground mb-2">{example.description}</p>
                    {example.code && (
                      <div className="bg-muted p-3 rounded text-sm font-mono">
                        {example.code}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sfaturi utile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {content.tips.map((tip, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Probleme comune și soluții</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {content.commonIssues.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-medium text-orange-700 mb-1">{issue.issue}</h5>
                        <p className="text-sm text-muted-foreground">{issue.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default HelpSystem;
