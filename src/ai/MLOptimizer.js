/**
 * Machine Learning-Based Template Optimization System
 * Uses AI to optimize template selection, generation patterns, and quality
 */

import { Logger } from '../utils/Logger.js';
import fs from 'fs-extra';
import path from 'path';

export class MLOptimizer {
  constructor(options = {}) {
    this.logger = new Logger('MLOptimizer');
    this.options = {
      dataDir: './ml-data',
      modelDir: './ml-models',
      enableLearning: true,
      minDataPoints: 10,
      trainingInterval: 24 * 60 * 60 * 1000, // 24 hours
      qualityThreshold: 0.7,
      ...options
    };

    this.generationHistory = [];
    this.userFeedback = [];
    this.templatePerformance = new Map();
    this.categoryInsights = new Map();
    this.optimizationModels = new Map();
    this.lastTraining = null;
  }

  /**
   * Initialize ML optimization system
   */
  async initialize() {
    try {
      this.logger.info('Initializing ML optimization system...');

      // Ensure directories exist
      await fs.ensureDir(this.options.dataDir);
      await fs.ensureDir(this.options.modelDir);

      // Load existing data
      await this.loadHistoricalData();
      await this.loadModels();

      // Initialize analysis models
      await this.initializeModels();

      this.logger.success('ML optimization system initialized');

    } catch (error) {
      this.logger.error('Failed to initialize ML optimization system', error);
      throw error;
    }
  }

  /**
   * Record generation event for learning
   * @param {Object} generationData - Data about the generation
   */
  async recordGeneration(generationData) {
    const record = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      category: generationData.category,
      techStack: generationData.techStack || [],
      featureFlags: generationData.featureFlags || [],
      templateId: generationData.templateId,
      result: {
        fileCount: generationData.fileCount,
        totalSize: generationData.totalSize,
        qualityScore: generationData.qualityScore,
        generationTime: generationData.generationTime,
        success: generationData.success
      },
      context: {
        projectName: generationData.projectName,
        targetAudience: generationData.targetAudience,
        deploymentTarget: generationData.deploymentTarget,
        complexity: generationData.complexity
      }
    };

    this.generationHistory.push(record);
    
    // Update template performance
    await this.updateTemplatePerformance(record);
    
    // Update category insights
    await this.updateCategoryInsights(record);

    // Save data periodically
    if (this.generationHistory.length % 10 === 0) {
      await this.saveData();
    }

    this.logger.debug('Generation recorded for ML learning', {
      category: record.category,
      qualityScore: record.result.qualityScore
    });
  }

  /**
   * Record user feedback for learning
   * @param {Object} feedback - User feedback data
   */
  async recordUserFeedback(feedback) {
    const feedbackRecord = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      generationId: feedback.generationId,
      rating: feedback.rating, // 1-5 scale
      comments: feedback.comments || '',
      improvements: feedback.improvements || [],
      issues: feedback.issues || [],
      wouldRecommend: feedback.wouldRecommend || false
    };

    this.userFeedback.push(feedbackRecord);
    
    // Apply feedback to improve models
    await this.incorporateFeedback(feedbackRecord);

    this.logger.info('User feedback recorded', {
      rating: feedbackRecord.rating,
      generationId: feedbackRecord.generationId
    });
  }

  /**
   * Get optimized template recommendation
   * @param {Object} inputs - Generation inputs
   * @returns {Object} Template recommendation with confidence score
   */
  async getTemplateRecommendation(inputs) {
    try {
      const analysis = await this.analyzeInputs(inputs);
      const recommendations = await this.generateRecommendations(analysis);
      
      return {
        primaryTemplate: recommendations[0],
        alternatives: recommendations.slice(1, 4),
        confidence: recommendations[0]?.confidence || 0.5,
        reasoning: this.explainRecommendation(recommendations[0], analysis),
        optimizations: await this.suggestOptimizations(inputs, recommendations[0])
      };

    } catch (error) {
      this.logger.error('Failed to generate template recommendation', error);
      
      // Fallback to basic recommendation
      return {
        primaryTemplate: await this.getBasicRecommendation(inputs),
        alternatives: [],
        confidence: 0.3,
        reasoning: 'Fallback recommendation due to ML analysis failure',
        optimizations: []
      };
    }
  }

  /**
   * Analyze inputs to understand generation context
   * @param {Object} inputs - Generation inputs
   * @returns {Object} Analysis results
   */
  async analyzeInputs(inputs) {
    const analysis = {
      category: inputs.category,
      complexity: this.analyzeComplexity(inputs),
      techStackPatterns: this.analyzeTechStack(inputs.techStack || []),
      featureComplexity: this.analyzeFeatures(inputs.featureFlags || []),
      audienceType: this.analyzeAudience(inputs.targetAudience || ''),
      deploymentContext: this.analyzeDeployment(inputs.deploymentTarget || ''),
      historicalPatterns: await this.findSimilarGenerations(inputs),
      trendAnalysis: await this.analyzeTrends(inputs.category)
    };

    return analysis;
  }

  /**
   * Analyze input complexity
   * @param {Object} inputs - Generation inputs
   * @returns {number} Complexity score (0-1)
   */
  analyzeComplexity(inputs) {
    let complexity = 0;

    // Base complexity from tech stack
    const techStackSize = (inputs.techStack || []).length;
    complexity += Math.min(techStackSize / 10, 0.3);

    // Feature complexity
    const featureCount = (inputs.featureFlags || []).length;
    complexity += Math.min(featureCount / 15, 0.4);

    // Category base complexity
    const categoryComplexity = {
      'web-app': 0.5,
      'rest-api': 0.4,
      'microservices': 0.8,
      'mobile-app': 0.6,
      'landing-page': 0.2,
      'desktop-app': 0.7
    };
    complexity += categoryComplexity[inputs.category] || 0.5;

    // Advanced features boost
    const advancedFeatures = ['authentication', 'monitoring', 'microservices', 'ai-integration'];
    const hasAdvanced = (inputs.featureFlags || []).some(f => advancedFeatures.includes(f));
    if (hasAdvanced) complexity += 0.2;

    return Math.min(complexity, 1.0);
  }

  /**
   * Analyze tech stack patterns
   * @param {Array} techStack - Technology stack
   * @returns {Object} Tech stack analysis
   */
  analyzeTechStack(techStack) {
    const patterns = {
      frontend: [],
      backend: [],
      database: [],
      tools: [],
      modern: 0,
      enterprise: 0
    };

    const categories = {
      frontend: ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js'],
      backend: ['Node.js', 'Python', 'Java', 'Go', 'PHP'],
      database: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL'],
      tools: ['Docker', 'Kubernetes', 'GraphQL', 'TypeScript']
    };

    const modernTech = ['React', 'Vue.js', 'TypeScript', 'GraphQL', 'Docker', 'Kubernetes'];
    const enterpriseTech = ['Java', 'PostgreSQL', 'Kubernetes', 'Enterprise'];

    for (const tech of techStack) {
      // Categorize
      for (const [category, techs] of Object.entries(categories)) {
        if (techs.includes(tech)) {
          patterns[category].push(tech);
        }
      }

      // Score modernity and enterprise readiness
      if (modernTech.includes(tech)) patterns.modern += 0.2;
      if (enterpriseTech.includes(tech)) patterns.enterprise += 0.2;
    }

    patterns.modern = Math.min(patterns.modern, 1.0);
    patterns.enterprise = Math.min(patterns.enterprise, 1.0);

    return patterns;
  }

  /**
   * Find similar historical generations
   * @param {Object} inputs - Current inputs
   * @returns {Array} Similar generations
   */
  async findSimilarGenerations(inputs) {
    const similar = [];
    const threshold = 0.6;

    for (const record of this.generationHistory) {
      const similarity = this.calculateSimilarity(inputs, record);
      
      if (similarity >= threshold) {
        similar.push({
          record,
          similarity,
          success: record.result.success,
          qualityScore: record.result.qualityScore
        });
      }
    }

    // Sort by similarity and quality
    return similar
      .sort((a, b) => (b.similarity * b.qualityScore) - (a.similarity * a.qualityScore))
      .slice(0, 10);
  }

  /**
   * Calculate similarity between inputs and historical record
   * @param {Object} inputs1 - First input set
   * @param {Object} inputs2 - Second input set
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(inputs1, inputs2) {
    let similarity = 0;
    let factors = 0;

    // Category match (most important)
    if (inputs1.category === inputs2.category) {
      similarity += 0.4;
    }
    factors += 0.4;

    // Tech stack overlap
    const techStack1 = inputs1.techStack || [];
    const techStack2 = inputs2.techStack || [];
    const techOverlap = this.calculateArrayOverlap(techStack1, techStack2);
    similarity += techOverlap * 0.3;
    factors += 0.3;

    // Feature overlap
    const features1 = inputs1.featureFlags || [];
    const features2 = inputs2.featureFlags || [];
    const featureOverlap = this.calculateArrayOverlap(features1, features2);
    similarity += featureOverlap * 0.2;
    factors += 0.2;

    // Deployment target
    if (inputs1.deploymentTarget === inputs2.deploymentTarget) {
      similarity += 0.1;
    }
    factors += 0.1;

    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Calculate overlap between two arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {number} Overlap score (0-1)
   */
  calculateArrayOverlap(arr1, arr2) {
    if (arr1.length === 0 && arr2.length === 0) return 1;
    if (arr1.length === 0 || arr2.length === 0) return 0;

    const intersection = arr1.filter(item => arr2.includes(item)).length;
    const union = new Set([...arr1, ...arr2]).size;
    
    return intersection / union;
  }

  /**
   * Generate template recommendations based on analysis
   * @param {Object} analysis - Input analysis
   * @returns {Array} Ranked recommendations
   */
  async generateRecommendations(analysis) {
    const recommendations = [];

    // Get template performance data
    const templatePerf = Array.from(this.templatePerformance.entries())
      .filter(([templateId, perf]) => perf.category === analysis.category)
      .map(([templateId, perf]) => ({
        templateId,
        avgQuality: perf.totalQuality / perf.usageCount,
        successRate: perf.successCount / perf.usageCount,
        usageCount: perf.usageCount,
        ...perf
      }))
      .sort((a, b) => (b.avgQuality * b.successRate) - (a.avgQuality * a.successRate));

    for (const template of templatePerf.slice(0, 5)) {
      const confidence = this.calculateConfidence(template, analysis);
      
      recommendations.push({
        templateId: template.templateId,
        confidence,
        avgQuality: template.avgQuality,
        successRate: template.successRate,
        usageCount: template.usageCount,
        reasoningFactors: this.getReasoningFactors(template, analysis)
      });
    }

    // If no historical data, use rule-based recommendations
    if (recommendations.length === 0) {
      recommendations.push(await this.getBasicRecommendation(analysis));
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate confidence score for a template recommendation
   * @param {Object} template - Template performance data
   * @param {Object} analysis - Input analysis
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(template, analysis) {
    let confidence = 0;

    // Base confidence from historical performance
    confidence += (template.avgQuality * 0.4);
    confidence += (template.successRate * 0.3);

    // Usage count confidence (more data = more confidence)
    const usageConfidence = Math.min(template.usageCount / 50, 0.2);
    confidence += usageConfidence;

    // Complexity match confidence
    const complexityMatch = 1 - Math.abs(template.avgComplexity - analysis.complexity);
    confidence += (complexityMatch * 0.1);

    return Math.min(confidence, 1.0);
  }

  /**
   * Update template performance metrics
   * @param {Object} record - Generation record
   */
  async updateTemplatePerformance(record) {
    const templateId = record.templateId;
    
    if (!this.templatePerformance.has(templateId)) {
      this.templatePerformance.set(templateId, {
        category: record.category,
        usageCount: 0,
        successCount: 0,
        totalQuality: 0,
        totalGenerationTime: 0,
        avgComplexity: 0,
        techStackFrequency: new Map(),
        featureFrequency: new Map()
      });
    }

    const perf = this.templatePerformance.get(templateId);
    
    perf.usageCount++;
    if (record.result.success) perf.successCount++;
    perf.totalQuality += record.result.qualityScore || 0;
    perf.totalGenerationTime += record.result.generationTime || 0;
    
    // Update complexity average
    const inputComplexity = this.analyzeComplexity(record);
    perf.avgComplexity = ((perf.avgComplexity * (perf.usageCount - 1)) + inputComplexity) / perf.usageCount;

    // Update tech stack frequency
    for (const tech of record.techStack || []) {
      perf.techStackFrequency.set(tech, (perf.techStackFrequency.get(tech) || 0) + 1);
    }

    // Update feature frequency
    for (const feature of record.featureFlags || []) {
      perf.featureFrequency.set(feature, (perf.featureFrequency.get(feature) || 0) + 1);
    }
  }

  /**
   * Analyze trends for a category
   * @param {string} category - Category to analyze
   * @returns {Object} Trend analysis
   */
  async analyzeTrends(category) {
    const categoryRecords = this.generationHistory
      .filter(r => r.category === category)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (categoryRecords.length < 5) {
      return { trend: 'stable', confidence: 0.3, insights: [] };
    }

    const recentRecords = categoryRecords.slice(-20);
    const olderRecords = categoryRecords.slice(0, -20);

    // Analyze quality trend
    const recentAvgQuality = recentRecords.reduce((sum, r) => sum + (r.result.qualityScore || 0), 0) / recentRecords.length;
    const olderAvgQuality = olderRecords.length > 0 
      ? olderRecords.reduce((sum, r) => sum + (r.result.qualityScore || 0), 0) / olderRecords.length 
      : recentAvgQuality;

    const qualityTrend = recentAvgQuality > olderAvgQuality ? 'improving' : 'declining';

    // Analyze popular tech stacks
    const techFrequency = new Map();
    recentRecords.forEach(r => {
      (r.techStack || []).forEach(tech => {
        techFrequency.set(tech, (techFrequency.get(tech) || 0) + 1);
      });
    });

    const popularTech = Array.from(techFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tech]) => tech);

    return {
      trend: qualityTrend,
      confidence: Math.min(categoryRecords.length / 50, 1.0),
      insights: [
        `Quality trend: ${qualityTrend}`,
        `Popular technologies: ${popularTech.join(', ')}`,
        `Recent average quality: ${recentAvgQuality.toFixed(2)}`
      ],
      popularTech,
      qualityTrend: {
        recent: recentAvgQuality,
        historical: olderAvgQuality,
        direction: qualityTrend
      }
    };
  }

  /**
   * Suggest optimizations for generation
   * @param {Object} inputs - Original inputs
   * @param {Object} recommendation - Template recommendation
   * @returns {Array} Optimization suggestions
   */
  async suggestOptimizations(inputs, recommendation) {
    const optimizations = [];

    if (!recommendation) return optimizations;

    // Tech stack optimizations
    const techAnalysis = this.analyzeTechStack(inputs.techStack || []);
    if (techAnalysis.modern < 0.5) {
      optimizations.push({
        type: 'tech-stack',
        priority: 'medium',
        suggestion: 'Consider adding modern technologies like TypeScript or Docker for better development experience',
        impact: 'Improved development workflow and code quality'
      });
    }

    // Feature optimizations
    const essentialFeatures = ['testing', 'documentation', 'security'];
    const missingEssentials = essentialFeatures.filter(f => !(inputs.featureFlags || []).includes(f));
    
    if (missingEssentials.length > 0) {
      optimizations.push({
        type: 'features',
        priority: 'high',
        suggestion: `Add essential features: ${missingEssentials.join(', ')}`,
        impact: 'Better code quality and maintainability'
      });
    }

    // Performance optimizations
    if (recommendation.avgQuality < 0.8) {
      optimizations.push({
        type: 'template',
        priority: 'medium',
        suggestion: 'Consider alternative template with higher quality score',
        impact: 'Improved generation quality and success rate'
      });
    }

    return optimizations;
  }

  /**
   * Load historical data
   */
  async loadHistoricalData() {
    try {
      const historyFile = path.join(this.options.dataDir, 'generation-history.json');
      const feedbackFile = path.join(this.options.dataDir, 'user-feedback.json');
      const performanceFile = path.join(this.options.dataDir, 'template-performance.json');

      if (await fs.pathExists(historyFile)) {
        this.generationHistory = await fs.readJson(historyFile);
      }

      if (await fs.pathExists(feedbackFile)) {
        this.userFeedback = await fs.readJson(feedbackFile);
      }

      if (await fs.pathExists(performanceFile)) {
        const perfData = await fs.readJson(performanceFile);
        this.templatePerformance = new Map(Object.entries(perfData));
      }

      this.logger.debug(`Loaded ML data: ${this.generationHistory.length} generations, ${this.userFeedback.length} feedback items`);

    } catch (error) {
      this.logger.debug('No historical data found, starting fresh');
    }
  }

  /**
   * Save ML data
   */
  async saveData() {
    try {
      const historyFile = path.join(this.options.dataDir, 'generation-history.json');
      const feedbackFile = path.join(this.options.dataDir, 'user-feedback.json');
      const performanceFile = path.join(this.options.dataDir, 'template-performance.json');

      await fs.writeJson(historyFile, this.generationHistory);
      await fs.writeJson(feedbackFile, this.userFeedback);
      
      // Convert Map to Object for serialization
      const perfObj = Object.fromEntries(this.templatePerformance);
      await fs.writeJson(performanceFile, perfObj);

      this.logger.debug('ML data saved successfully');

    } catch (error) {
      this.logger.error('Failed to save ML data', error);
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Initialize ML models (placeholder for future ML integration)
   */
  async initializeModels() {
    // Placeholder for TensorFlow.js or other ML library integration
    this.logger.debug('ML models initialized (basic heuristic implementation)');
  }

  /**
   * Load trained models
   */
  async loadModels() {
    // Placeholder for loading pre-trained models
    this.logger.debug('ML models loaded (basic implementation)');
  }

  /**
   * Basic recommendation fallback
   */
  async getBasicRecommendation(inputs) {
    const categoryTemplates = {
      'web-app': 'react-web-app',
      'rest-api': 'express-api',
      'landing-page': 'landing-page-template',
      'mobile-app': 'react-native-app',
      'microservices': 'microservice-template'
    };

    return {
      templateId: categoryTemplates[inputs.category] || 'default-template',
      confidence: 0.5,
      avgQuality: 0.7,
      successRate: 0.8,
      usageCount: 0,
      reasoningFactors: ['Category-based fallback recommendation']
    };
  }

  /**
   * Generate usage report
   */
  generateReport() {
    const totalGenerations = this.generationHistory.length;
    const totalFeedback = this.userFeedback.length;
    
    const avgQuality = totalGenerations > 0 
      ? this.generationHistory.reduce((sum, r) => sum + (r.result.qualityScore || 0), 0) / totalGenerations
      : 0;

    const successRate = totalGenerations > 0
      ? this.generationHistory.filter(r => r.result.success).length / totalGenerations
      : 0;

    return {
      totalGenerations,
      totalFeedback,
      avgQuality: Math.round(avgQuality * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      templatePerformanceCount: this.templatePerformance.size,
      dataPoints: totalGenerations + totalFeedback,
      learningEnabled: this.options.enableLearning,
      lastTraining: this.lastTraining
    };
  }
}