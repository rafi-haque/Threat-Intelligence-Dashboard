#!/usr/bin/env node

/**
 * Simple Data Population Script
 * Just runs the ingestion service directly
 */

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Populating Threat Intelligence Database...');
console.log('=' .repeat(50));

// Start the backend temporarily to populate data
const backend = spawn('npm', ['run', 'dev:backend'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

let dataPopulated = false;
let indicatorCount = 0;

backend.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Look for ingestion completion
  if (output.includes('Ingestion pipeline completed')) {
    dataPopulated = true;
  }
  
  // Extract indicator count
  const match = output.match(/total_indicators[^\d]*(\d+)/);
  if (match) {
    indicatorCount = parseInt(match[1]);
  }
  
  // Stop after ingestion completes
  if (dataPopulated && indicatorCount > 0) {
    console.log(`✅ Data population completed: ${indicatorCount.toLocaleString()} indicators`);
    backend.kill('SIGTERM');
    process.exit(0);
  }
});

backend.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Timeout after 2 minutes
setTimeout(() => {
  console.log('⏰ Timeout reached - stopping backend');
  backend.kill('SIGTERM');
  
  if (indicatorCount > 0) {
    console.log(`✅ Partial success: ${indicatorCount.toLocaleString()} indicators populated`);
    process.exit(0);
  } else {
    console.log('❌ No data was populated - check your configuration');
    process.exit(1);
  }
}, 120000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Process interrupted');
  backend.kill('SIGTERM');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Process terminated');
  backend.kill('SIGTERM');
  process.exit(1);
});