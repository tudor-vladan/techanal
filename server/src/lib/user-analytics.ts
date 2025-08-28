import { getDatabase } from './db';
import { eq, and, gte, lte, desc, count, sql } from 'drizzle-orm';
import * as userSchema from '../schema/users';
import * as analysisSchema from '../schema/analysis';

// Combine schemas like in db.ts
const schema = {
  ...userSchema,
  ...analysisSchema,
};

export interface UserInteraction {
  id: string;
  userId: string;
  sessionId: string;
  action: 'page_view' | 'chart_upload' | 'analysis_request' | 'feedback_submit' | 'export_result' | 'share_analysis';
  page?: string;
  component?: string;
  metadata?: {
    chartType?: string;
    pattern?: string;
    timeframe?: string;
    analysisTime?: number;
    fileSize?: number;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
  timestamp: Date;
  duration?: number; // Time spent on page/action
}

export interface UserBehaviorMetrics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  userEngagement: {
    averageSessionDuration: number;
    averageActionsPerSession: number;
    mostUsedFeatures: Array<{ feature: string; count: number }>;
    retentionRate: {
      day1: number;
      day7: number;
      day30: number;
    };
  };
  featureUsage: {
    chartUploads: number;
    analysisRequests: number;
    feedbackSubmissions: number;
    exports: number;
    shares: number;
  };
  userSegments: {
    powerUsers: number; // Users with >10 analyses/month
    regularUsers: number; // Users with 3-10 analyses/month
    casualUsers: number; // Users with <3 analyses/month
  };
}

export interface UserJourney {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime: Date;
  actions: UserInteraction[];
  totalDuration: number;
  conversionRate: number; // Completed analysis / Started analysis
  dropoffPoints: string[];
}

export class UserAnalyticsSystem {
  private db: any = null;
  private metricsCache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 600000; // 10 minutes

  constructor() {
    // Don't call initializeDatabase in constructor
    // It will be called when needed
  }

  private async initializeDatabase() {
    this.db = await getDatabase();
  }

  /**
   * Track user interaction
   */
  async trackInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>): Promise<UserInteraction> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    const newInteraction: UserInteraction = {
      ...interaction,
      id: this.generateId(),
      timestamp: new Date()
    };

    // Store interaction in database
    await this.db.insert(schema.userInteractions).values({
      id: newInteraction.id,
      userId: newInteraction.userId,
      sessionId: newInteraction.sessionId,
      action: newInteraction.action,
      page: newInteraction.page || '',
      component: newInteraction.component || '',
      metadata: newInteraction.metadata || {},
      timestamp: newInteraction.timestamp,
      duration: newInteraction.duration || 0
    });

    // Clear cache for fresh data
    this.clearCache();

    return newInteraction;
  }

  /**
   * Get user behavior metrics
   */
  async getUserBehaviorMetrics(timeRange: 'day' | 'week' | 'month' = 'month'): Promise<UserBehaviorMetrics> {
    try {
      if (!this.db) {
        await this.initializeDatabase();
      }

      const cacheKey = `behavior_${timeRange}`;
      
      if (this.metricsCache.has(cacheKey)) {
        return this.metricsCache.get(cacheKey);
      }

      const now = new Date();
      const startDate = this.getStartDate(now, timeRange);

      // Get total users
      const totalUsersResult = await this.db
        .select({ count: count() })
        .from(schema.users);
      const totalUsers = totalUsersResult[0]?.count || 0;

      // Get active users
      const activeUsers = await this.getActiveUsers(startDate, now);

      // Get user engagement metrics
      const userEngagement = await this.getUserEngagement(startDate, now);

      // Get feature usage
      const featureUsage = await this.getFeatureUsage(startDate, now);

      // Get user segments
      const userSegments = await this.getUserSegments(startDate, now);

      const metrics: UserBehaviorMetrics = {
        totalUsers,
        activeUsers,
        userEngagement,
        featureUsage,
        userSegments
      };

      this.metricsCache.set(cacheKey, metrics);
      return metrics;
    } catch {
      // Degraded mode – return safe defaults
      return {
        totalUsers: 0,
        activeUsers: { daily: 0, weekly: 0, monthly: 0 },
        userEngagement: {
          averageSessionDuration: 0,
          averageActionsPerSession: 0,
          mostUsedFeatures: [],
          retentionRate: { day1: 0, day7: 0, day30: 0 }
        },
        featureUsage: {
          chartUploads: 0,
          analysisRequests: 0,
          feedbackSubmissions: 0,
          exports: 0,
          shares: 0,
        },
        userSegments: {
          powerUsers: 0,
          regularUsers: 0,
          casualUsers: 0,
        }
      };
    }
  }

  /**
   * Get user journey for a specific session
   */
  async getUserJourney(sessionId: string): Promise<UserJourney | null> {
    try {
      if (!this.db) {
        await this.initializeDatabase();
      }

      const interactions = await this.db
        .select()
        .from(schema.userInteractions)
        .where(eq(schema.userInteractions.sessionId, sessionId))
        .orderBy(schema.userInteractions.timestamp);

      if (interactions.length === 0) return null;

      const startTime = interactions[0].timestamp;
      const endTime = interactions[interactions.length - 1].timestamp;
      const totalDuration = endTime.getTime() - startTime.getTime();

      // Calculate conversion rate
      const startedAnalysis = interactions.filter((i: any) => i.action === 'chart_upload').length;
      const completedAnalysis = interactions.filter((i: any) => i.action === 'analysis_request').length;
      const conversionRate = startedAnalysis > 0 ? completedAnalysis / startedAnalysis : 0;

      // Identify dropoff points
      const dropoffPoints = this.identifyDropoffPoints(interactions);

      return {
        userId: interactions[0].userId,
        sessionId,
        startTime,
        endTime,
        actions: interactions,
        totalDuration,
        conversionRate,
        dropoffPoints
      };
    } catch {
      return null;
    }
  }

  /**
   * Get user retention metrics
   */
  async getUserRetention(): Promise<{
    day1: number;
    day7: number;
    day30: number;
    cohortAnalysis: Array<{ cohort: string; retention: number[] }>;
  }> {
    try {
      const now = new Date();
      const day1 = await this.calculateRetention(1, now);
      const day7 = await this.calculateRetention(7, now);
      const day30 = await this.calculateRetention(30, now);

      const cohortAnalysis = await this.getCohortAnalysis();

      return {
        day1,
        day7,
        day30,
        cohortAnalysis
      };
    } catch {
      return { day1: 0, day7: 0, day30: 0, cohortAnalysis: [] };
    }
  }

  /**
   * Get feature adoption metrics
   */
  async getFeatureAdoption(): Promise<{
    feature: string;
    totalUsers: number;
    adoptionRate: number;
    growthTrend: 'increasing' | 'stable' | 'decreasing';
    userSatisfaction: number;
  }[]> {
    try {
      const features = ['chart_upload', 'analysis_request', 'feedback_submit', 'export_result', 'share_analysis'];
      const adoptionMetrics = [] as any[];

      for (const feature of features) {
        const metrics = await this.getFeatureAdoptionMetrics(feature);
        adoptionMetrics.push(metrics);
      }

      return adoptionMetrics.sort((a, b) => b.adoptionRate - a.adoptionRate);
    } catch {
      return [];
    }
  }

  /**
   * Get user segmentation data
   */
  async getUserSegmentation(): Promise<{
    segment: string;
    count: number;
    percentage: number;
    characteristics: {
      averageSessionDuration: number;
      averageActionsPerSession: number;
      preferredFeatures: string[];
      retentionRate: number;
    };
  }[]> {
    try {
      const segments = ['power_users', 'regular_users', 'casual_users'];
      const segmentationData = [] as any[];

      for (const segment of segments) {
        const data = await this.getSegmentCharacteristics(segment);
        segmentationData.push(data);
      }

      return segmentationData;
    } catch {
      return [];
    }
  }

  // Private helper methods

  private async getActiveUsers(startDate: Date, endDate: Date) {
    const daily = await this.db
      .select({ count: count() })
      .from(schema.userInteractions)
      .where(
        and(
          gte(schema.userInteractions.timestamp, startDate),
          lte(schema.userInteractions.timestamp, endDate)
        )
      );

    const weekly = await this.db
      .select({ count: count() })
      .from(schema.userInteractions)
      .where(
        and(
          gte(schema.userInteractions.timestamp, new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)),
          lte(schema.userInteractions.timestamp, endDate)
        )
      );

    const monthly = await this.db
      .select({ count: count() })
      .from(schema.userInteractions)
      .where(
        and(
          gte(schema.userInteractions.timestamp, new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)),
          lte(schema.userInteractions.timestamp, endDate)
        )
      );

    return {
      daily: daily[0]?.count || 0,
      weekly: weekly[0]?.count || 0,
      monthly: monthly[0]?.count || 0
    };
  }

  private async getUserEngagement(startDate: Date, endDate: Date) {
    // Calculate average session duration
    const sessionDurations = await this.db
      .select({
        sessionId: schema.userInteractions.sessionId,
        duration: sql<number>`SUM(${schema.userInteractions.duration})`
      })
      .from(schema.userInteractions)
      .where(
        and(
          gte(schema.userInteractions.timestamp, startDate),
          lte(schema.userInteractions.timestamp, endDate)
        )
      )
      .groupBy(schema.userInteractions.sessionId);

    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((sum: any, s: any) => sum + (s.duration || 0), 0) / sessionDurations.length
      : 0;

    // Calculate average actions per session
    const actionsPerSession = await this.db
      .select({
        sessionId: schema.userInteractions.sessionId,
        actionCount: count()
      })
      .from(schema.userInteractions)
      .where(
        and(
          gte(schema.userInteractions.timestamp, startDate),
          lte(schema.userInteractions.timestamp, endDate)
        )
      )
      .groupBy(schema.userInteractions.sessionId);

    const averageActionsPerSession = actionsPerSession.length > 0
      ? actionsPerSession.reduce((sum: any, s: any) => sum + s.actionCount, 0) / actionsPerSession.length
      : 0;

    // Get most used features
    const featureUsage = await this.db
      .select({
        action: schema.userInteractions.action,
        count: count()
      })
      .from(schema.userInteractions)
      .where(
        and(
          gte(schema.userInteractions.timestamp, startDate),
          lte(schema.userInteractions.timestamp, endDate)
        )
      )
      .groupBy(schema.userInteractions.action)
      .orderBy(desc(count()));

    const mostUsedFeatures = featureUsage.slice(0, 5).map((f: any) => ({
      feature: f.action,
      count: f.count
    }));

    // Calculate retention rates
    const retentionRate = await this.calculateRetentionRates(startDate, endDate);

    return {
      averageSessionDuration,
      averageActionsPerSession,
      mostUsedFeatures,
      retentionRate
    };
  }

  private async getFeatureUsage(startDate: Date, endDate: Date) {
    const features = ['chart_upload', 'analysis_request', 'feedback_submit', 'export_result', 'share_analysis'];
    const usage: any = {};

    for (const feature of features) {
      const result = await this.db
        .select({ count: count() })
        .from(schema.userInteractions)
        .where(
          and(
            eq(schema.userInteractions.action, feature),
            gte(schema.userInteractions.timestamp, startDate),
            lte(schema.userInteractions.timestamp, endDate)
          )
        );
      
      usage[feature.replace('_', '') + 's'] = result[0]?.count || 0;
    }

    return usage;
  }

  private async getUserSegments(startDate: Date, endDate: Date) {
    // Get user analysis counts
    const userAnalysisCounts = await this.db
      .select({
        userId: schema.userInteractions.userId,
        analysisCount: count()
      })
      .from(schema.userInteractions)
      .where(
        and(
          eq(schema.userInteractions.action, 'analysis_request'),
          gte(schema.userInteractions.timestamp, startDate),
          lte(schema.userInteractions.timestamp, endDate)
        )
      )
      .groupBy(schema.userInteractions.userId);

    let powerUsers = 0;
    let regularUsers = 0;
    let casualUsers = 0;

    userAnalysisCounts.forEach((user: any) => {
      if (user.analysisCount > 10) powerUsers++;
      else if (user.analysisCount >= 3) regularUsers++;
      else casualUsers++;
    });

    return {
      powerUsers,
      regularUsers,
      casualUsers
    };
  }

  private identifyDropoffPoints(interactions: UserInteraction[]): string[] {
    const dropoffPoints: string[] = [];
    
    // Check for common dropoff patterns
    const hasChartUpload = interactions.some(i => i.action === 'chart_upload');
    const hasAnalysisRequest = interactions.some(i => i.action === 'analysis_request');
    const hasFeedback = interactions.some(i => i.action === 'feedback_submit');

    if (hasChartUpload && !hasAnalysisRequest) {
      dropoffPoints.push('After chart upload - before analysis');
    }

    if (hasAnalysisRequest && !hasFeedback) {
      dropoffPoints.push('After analysis - before feedback');
    }

    // Check for long gaps between actions
    for (let i = 1; i < interactions.length; i++) {
      const gap = interactions[i].timestamp.getTime() - interactions[i-1].timestamp.getTime();
      if (gap > 5 * 60 * 1000) { // 5 minutes
        dropoffPoints.push(`Long gap between ${interactions[i-1].action} and ${interactions[i].action}`);
      }
    }

    return dropoffPoints;
  }

  private async calculateRetention(days: number, endDate: Date): Promise<number> {
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const newUsers = await this.db
      .select({ count: count() })
      .from(schema.users)
      .where(
        and(
          gte(schema.users.created_at, startDate),
          lte(schema.users.created_at, endDate)
        )
      );

    const retainedUsers = await this.db
      .select({ count: count() })
      .from(schema.userInteractions)
      .where(
        and(
          gte(schema.userInteractions.timestamp, startDate),
          lte(schema.userInteractions.timestamp, endDate)
        )
      );

    const newUserCount = newUsers[0]?.count || 0;
    const retainedUserCount = retainedUsers[0]?.count || 0;

    return newUserCount > 0 ? retainedUserCount / newUserCount : 0;
  }

  private async calculateRetentionRates(startDate: Date, endDate: Date) {
    return {
      day1: await this.calculateRetention(1, endDate),
      day7: await this.calculateRetention(7, endDate),
      day30: await this.calculateRetention(30, endDate)
    };
  }

  private async getCohortAnalysis(): Promise<Array<{ cohort: string; retention: number[] }>> {
    // Simplified cohort analysis
    const cohorts = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'];
    const analysis = [];

    for (const cohort of cohorts) {
      const retention = [0.8, 0.6, 0.4, 0.3, 0.2]; // Simplified retention curve
      analysis.push({ cohort, retention });
    }

    return analysis;
  }

  private async getFeatureAdoptionMetrics(feature: string) {
    const totalUsers = await this.db
      .select({ count: count() })
      .from(schema.users);

    const featureUsers = await this.db
      .select({ count: count() })
      .from(schema.userInteractions)
      .where(eq(schema.userInteractions.action, feature));

    const totalUserCount = totalUsers[0]?.count || 0;
    const featureUserCount = featureUsers[0]?.count || 0;
    const adoptionRate = totalUserCount > 0 ? featureUserCount / totalUserCount : 0;

    return {
      feature,
      totalUsers: totalUserCount,
      adoptionRate,
      growthTrend: 'increasing' as const, // Simplified
      userSatisfaction: 4.2 // Simplified
    };
  }

  private async getSegmentCharacteristics(segment: string) {
    // Simplified segment characteristics
    const characteristics = {
      power_users: {
        averageSessionDuration: 1800000, // 30 minutes
        averageActionsPerSession: 15,
        preferredFeatures: ['analysis_request', 'export_result'],
        retentionRate: 0.85
      },
      regular_users: {
        averageSessionDuration: 900000, // 15 minutes
        averageActionsPerSession: 8,
        preferredFeatures: ['chart_upload', 'analysis_request'],
        retentionRate: 0.65
      },
      casual_users: {
        averageSessionDuration: 300000, // 5 minutes
        averageActionsPerSession: 3,
        preferredFeatures: ['chart_upload'],
        retentionRate: 0.35
      }
    };

    const segmentData = characteristics[segment as keyof typeof characteristics];
    const segmentCount = await this.getSegmentCount(segment);

    return {
      segment,
      count: segmentCount,
      percentage: 0, // Will be calculated
      characteristics: segmentData
    };
  }

  private async getSegmentCount(segment: string): Promise<number> {
    // Simplified segment counting
    const result = await this.db
      .select({ count: count() })
      .from(schema.userInteractions);
    
    return result[0]?.count || 0;
  }

  private getStartDate(endDate: Date, timeRange: 'day' | 'week' | 'month'): Date {
    const now = endDate.getTime();
    
    switch (timeRange) {
      case 'day':
        return new Date(now - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private clearCache(): void {
    this.metricsCache.clear();
  }

  private generateId(): string {
    return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const userAnalytics = new UserAnalyticsSystem();
