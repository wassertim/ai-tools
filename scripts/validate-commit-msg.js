#!/usr/bin/env node

import { readFileSync } from 'fs';
import { exit } from 'process';

/**
 * Husky commit-msg hook to prevent Claude attribution in commit messages
 * Usage: node validate-commit-msg.js <commit-msg-file>
 */

const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
  console.error('❌ Error: No commit message file provided');
  exit(1);
}

let commitMsg;
try {
  commitMsg = readFileSync(commitMsgFile, 'utf8');
} catch (error) {
  console.error('❌ Error reading commit message file:', error.message);
  exit(1);
}

// Define patterns to detect Claude attribution
const claudePatterns = [
  /🤖 Generated with.*Claude/i,
  /Generated with.*Claude Code/i,
  /Co-Authored-By: Claude/i,
  /claude\.com\/claude-code/i,
  /@anthropic\.com/i,
  /Claude Code.*anthropic/i,
  /Generated with \[Claude Code\]/i,
  /\[Claude Code\]\(https:\/\/claude\.com\/claude-code\)/i
];

// Colors for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  reset: '\x1b[0m'
};

/**
 * Check if commit message contains Claude attribution
 * @param {string} message - The commit message to check
 * @returns {object} - Result object with found patterns
 */
function checkClaudeAttribution(message) {
  const foundPatterns = [];

  for (const pattern of claudePatterns) {
    const match = message.match(pattern);
    if (match) {
      foundPatterns.push({
        pattern: pattern.source,
        match: match[0]
      });
    }
  }

  return {
    hasAttribution: foundPatterns.length > 0,
    patterns: foundPatterns
  };
}

// Validate the commit message
const result = checkClaudeAttribution(commitMsg);

if (result.hasAttribution) {
  console.log(`${colors.red}❌ COMMIT REJECTED${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Commit message contains Claude attribution.${colors.reset}\n`);

  console.log('Found Claude attribution patterns:');
  result.patterns.forEach(({ pattern, match }) => {
    console.log(`  ${colors.red}•${colors.reset} Pattern: ${pattern}`);
    console.log(`    ${colors.yellow}Match:${colors.reset} "${match}"`);
  });

  console.log('\nPlease edit your commit message to remove Claude attribution.');
  console.log('Use: git commit --amend -m "your new message"\n');

  exit(1); // Reject the commit
}

console.log(`${colors.green}✅ Commit message validated - no Claude attribution detected${colors.reset}`);
exit(0); // Accept the commit