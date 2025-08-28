import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserFeedback, 
  BacktestingDashboard, 
  UserAnalyticsDashboard, 
  ContinuousLearningDashboard,
  BusinessIntelligenceDashboard,
  AdvancedStrategiesDashboard
} from '@/components';
import { 
  Brain, 
  BarChart3, 
  Users, 
  Target,
  Zap,
  Lightbulb,
  TrendingUp,
  Rocket,
  HelpCircle
} from 'lucide-react';
import HelpSystem from '@/components/HelpSystem';

const LearningAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [mockUserId] = useState('user-123');

  const tabs = [
    {
      id: 'feedback',
      label: 'User Feedback',
      icon: <Target className="w-4 h-4" />,
      description: 'Collect and analyze user feedback for AI model improvement',
      component: (
        <UserFeedback
          analysisId="analysis-456"
          userId={mockUserId}
          metadata={{
            chartType: 'candlestick',
            timeframe: '1h',
            assetType: 'crypto'
          }}
          onSubmit={(feedback) => console.log('Feedback submitted:', feedback)}
        />
      )
    },
    {
      id: 'backtesting',
      label: 'Backtesting',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Test trading strategies with historical data',
      component: (
        <BacktestingDashboard
          userId={mockUserId}
        />
      )
    },
    {
      id: 'analytics',
      label: 'User Analytics',
      icon: <Users className="w-4 h-4" />,
      description: 'Track user behavior and generate insights',
      component: (
        <UserAnalyticsDashboard />
      )
    },
    {
      id: 'learning',
      label: 'Continuous Learning',
      icon: <Brain className="w-4 h-4" />,
      description: 'Monitor AI model performance and drive improvements',
      component: (
        <ContinuousLearningDashboard />
      )
    },
    {
      id: 'business-intelligence',
      label: 'Business Intelligence',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Advanced business analytics and reporting',
      component: (
        <BusinessIntelligenceDashboard />
      )
    },
    {
      id: 'advanced-strategies',
      label: 'Advanced Strategies',
      icon: <Rocket className="w-4 h-4" />,
      description: 'Run and optimize algorithmic strategies',
      component: (
        <AdvancedStrategiesDashboard />
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Learning & Analytics</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced AI-powered learning systems, user analytics, and continuous improvement tools
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI-Powered
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Machine Learning
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Real-time Analytics
          </Badge>
        </div>
        <div className="flex justify-center mt-4">
          <HelpSystem feature="learning-analytics" variant="outline" size="sm" />
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="text-center p-6">
          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">User Feedback</h3>
          <p className="text-gray-600 text-sm">
            Collect structured feedback to improve AI model accuracy and user satisfaction
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Strategy Backtesting</h3>
          <p className="text-gray-600 text-sm">
            Test trading strategies with historical data and performance metrics
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">User Analytics</h3>
          <p className="text-gray-600 text-sm">
            Track user behavior patterns and generate actionable insights
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="p-3 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Continuous Learning</h3>
          <p className="text-gray-600 text-sm">
            Monitor AI performance and drive automated model improvements
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="p-3 bg-indigo-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Business Intelligence</h3>
          <p className="text-gray-600 text-sm">
            Advanced business analytics and comprehensive reporting
          </p>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Interactive Components
          </CardTitle>
          <CardDescription>
            Explore the different learning and analytics features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b pb-4">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  {tab.icon}
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              {tabs.map((tab) => (
                <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{tab.label}</h3>
                    <p className="text-gray-600">{tab.description}</p>
                  </div>
                  {tab.component}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Technical Architecture
          </CardTitle>
          <CardDescription>
            How the learning and analytics systems work together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Data Flow</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>User interactions → Analytics tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Feedback submission → Learning system</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Performance metrics → Model improvement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Strategy testing → Backtesting engine</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Key Benefits</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Real-time performance monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Automated model optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Data-driven decision making</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Continuous learning loop</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningAnalytics;
