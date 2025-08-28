#!/usr/bin/env node

/**
 * Script pentru actualizarea automată a fișierului de progres al dezvoltării
 * Usage: node scripts/update-progress.js [feature] [status]
 * 
 * Examples:
 * - node scripts/update-progress.js "AI Analysis Engine" "complete"
 * - node scripts/update-progress.js "Pattern Recognition" "in-progress"
 * - node scripts/update-progress.js "User Testing" "started"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Status mappings
const STATUS_MAP = {
  'complete': '✅ COMPLET',
  'in-progress': '🔄 ÎN CURS',
  'started': '🟡 ÎNCEPUT',
  'planned': '❌ ÎN AȘTEPTARE',
  'testing': '🧪 ÎN TESTARE',
  'deployed': '🚀 DEPLOYAT'
};

// Feature categories
const FEATURE_CATEGORIES = {
  'infrastructure': 'Faza 1: Setup și Infrastructura',
  'ai-engine': 'Faza 2: Backend și AI Engine',
  'frontend': 'Faza 3: Frontend și UI/UX',
  'ai-models': 'Faza 4: AI Models și Training',
  'testing': 'Faza 5: Testing și Optimizare',
  'deployment': 'Faza 6: Deployment și Monitorizare'
};

function updateProgressFile(feature, status) {
  const progressFile = path.join(__dirname, '..', 'docs', 'DEVELOPMENT_PROGRESS.md');
  
  if (!fs.existsSync(progressFile)) {
    console.error('❌ Fișierul DEVELOPMENT_PROGRESS.md nu există!');
    return;
  }

  let content = fs.readFileSync(progressFile, 'utf8');
  
  // Find and update the feature
  const statusSymbol = STATUS_MAP[status] || status;
  
  // Update checkbox format
  const checkboxPattern = new RegExp(`- \\[([ x])\\] \\*\\*${escapeRegex(feature)}\\*\\*`, 'g');
  const newCheckbox = `- [x] **${feature}**`;
  
  if (checkboxPattern.test(content)) {
    content = content.replace(checkboxPattern, newCheckbox);
    console.log(`✅ Actualizat: ${feature} -> ${statusSymbol}`);
  } else {
    // Try to find without bold formatting
    const simplePattern = new RegExp(`- \\[([ x])\\] ${escapeRegex(feature)}`, 'g');
    if (simplePattern.test(content)) {
      content = content.replace(simplePattern, `- [x] ${feature}`);
      console.log(`✅ Actualizat: ${feature} -> ${statusSymbol}`);
    } else {
      console.log(`⚠️  Nu s-a găsit feature-ul: ${feature}`);
      console.log('💡 Încearcă să cauți cu numele exact din fișier');
      return;
    }
  }

  // Update last modified date
  const datePattern = /(\*\*Ultima actualizare\*\*: ).*/;
  const currentDate = new Date().toLocaleDateString('ro-RO');
  content = content.replace(datePattern, `$1${currentDate}`);

  // Update progress percentage if needed
  updateProgressPercentage(content);

  // Write back to file
  fs.writeFileSync(progressFile, content, 'utf8');
  console.log(`📝 Fișierul a fost actualizat cu succes!`);
}

function updateProgressPercentage(content) {
  // Count completed vs total features
  const totalFeatures = (content.match(/- \[[ x]\]/g) || []).length;
  const completedFeatures = (content.match(/- \[x\]/g) || []).length;
  
  if (totalFeatures > 0) {
    const percentage = Math.round((completedFeatures / totalFeatures) * 100);
    
    // Update progress percentage
    const progressPattern = /(\*\*Status general\*\*: )\d+% complet/;
    if (progressPattern.test(content)) {
      content = content.replace(progressPattern, `$1${percentage}% complet`);
    }
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showHelp() {
  console.log(`
📋 Script pentru actualizarea progresului dezvoltării

Usage: node scripts/update-progress.js [feature] [status]

Status options:
  complete      - ✅ COMPLET
  in-progress   - 🔄 ÎN CURS  
  started       - 🟡 ÎNCEPUT
  planned       - ❌ ÎN AȘTEPTARE
  testing       - 🧪 ÎN TESTARE
  deployed      - 🚀 DEPLOYAT

Examples:
  node scripts/update-progress.js "AI Analysis Engine" complete
  node scripts/update-progress.js "Pattern Recognition" in-progress
  node scripts/update-progress.js "User Testing" started

Features disponibile (exemple):
  - "Docker Compose"
  - "PostgreSQL"
  - "Chart Area Detection"
  - "Pattern Recognition"
  - "AI Analysis Engine"
  - "Custom Prompt Processing"
  - "Chart Upload Zone"
  - "Prompt Editor"
  - "Analysis Results"
  - "History Dashboard"
  - "Settings Panel"
  - "Real-time Processing"
  - "Responsive Design"
  - "Dark/Light Theme"
  - "Authentication System"
  - "Navigation"
  - "Chart Overlay"
  - "Interactive Elements"
  - "Comparison Mode"
  - "Alert System"
  - "Base Model"
  - "Chart Pattern Recognition"
  - "Technical Indicator Analysis"
  - "Market Sentiment Analysis"
  - "Risk Assessment Engine"
  - "Historical Charts"
  - "Expert Annotations"
  - "Backtesting"
  - "Continuous Learning"
  - "Unit Tests"
  - "Integration Tests"
  - "Performance Tests"
  - "User Acceptance Tests"
  - "Image Processing"
  - "AI Inference"
  - "Database"
  - "Frontend"
  - "Local Processing"
  - "Data Encryption"
  - "Access Control"
  - "Audit Logging"
  - "Multi-stage Builds"
  - "Environment Variables"
  - "Health Checks"
  - "Volume Mounts"
  - "Performance Metrics"
  - "Error Tracking"
  - "Usage Analytics"
  - "AI Model Performance"
  - "User Manual"
  - "API Documentation"
  - "Troubleshooting Guide"
  - "Video Tutorials"
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.length < 2) {
    console.error('❌ Eroare: Trebuie să specifici feature-ul și statusul!');
    console.log('💡 Folosește: node scripts/update-progress.js [feature] [status]');
    console.log('💡 Pentru ajutor: node scripts/update-progress.js --help');
    return;
  }
  
  const feature = args[0];
  const status = args[1];
  
  if (!STATUS_MAP[status]) {
    console.error(`❌ Status invalid: ${status}`);
    console.log('💡 Status-uri valide:', Object.keys(STATUS_MAP).join(', '));
    return;
  }
  
  updateProgressFile(feature, status);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { updateProgressFile, STATUS_MAP };
