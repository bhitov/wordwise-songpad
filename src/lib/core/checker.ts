/**
 * @file LanguageTool API client for grammar and spell checking.
 * @see https://languagetool.org/http-api/
 */

/**
 * LanguageTool API response types
 */
export interface LanguageToolMatch {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: Array<{
    value: string;
  }>;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  sentence: string;
  type: {
    typeName: string;
  };
  rule: {
    id: string;
    description: string;
    issueType: string;
    category: {
      id: string;
      name: string;
    };
  };
  ignoreForIncompleteSentence: boolean;
  contextForSureMatch: number;
}

export interface LanguageToolResponse {
  software: {
    name: string;
    version: string;
    buildDate: string;
    apiVersion: number;
    premium: boolean;
    premiumHint: string;
    status: string;
  };
  warnings: {
    incompleteResults: boolean;
  };
  language: {
    name: string;
    code: string;
    detectedLanguage: {
      name: string;
      code: string;
      confidence: number;
    };
  };
  matches: LanguageToolMatch[];
}

/**
 * LanguageTool API client configuration
 */
const LANGUAGETOOL_API_URL = 'http://54.242.206.96:8010/v2/check';

/**
 * Check text for grammar and spelling errors using LanguageTool API.
 * 
 * @param text - The text to check for errors
 * @param language - Language code (default: 'en-US')
 * @returns Promise resolving to LanguageTool response
 */
export async function checkText(
  text: string,
  language: string = 'en-US'
): Promise<LanguageToolResponse> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  try {
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', language);
    
    // Additional parameters for better checking
    params.append('enabledOnly', 'false');
    params.append('level', 'picky');
    
    // Disable whitespace-related rules to avoid annoying corrections for multiple spaces
    // WHITESPACE_RULE: Detects incorrect whitespace usage
    // CONSECUTIVE_SPACES: Detects multiple consecutive spaces
    // COMMA_COMPOUND_SENTENCE: Suggests comma before 'and' in independent clauses (Oxford comma style)
    params.append('disabledRules', 'WHITESPACE_RULE,CONSECUTIVE_SPACES,COMMA_COMPOUND_SENTENCE');

    const response = await fetch(LANGUAGETOOL_API_URL, {
      method: 'POST',
      body: params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`LanguageTool API error: ${response.status} ${response.statusText}`);
    }

    const data: LanguageToolResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking text with LanguageTool:', error);
    throw error;
  }
}

/**
 * Transform LanguageTool matches into a simplified format for our UI.
 * 
 * @param matches - Array of LanguageTool matches
 * @returns Simplified correction suggestions
 */
export interface SimplifiedCorrection {
  id: string;
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  originalText: string;
  suggestions: string[];
  type: 'grammar' | 'spelling' | 'style';
  category: string;
}

export function transformMatches(matches: LanguageToolMatch[]): SimplifiedCorrection[] {
  return matches.map((match, index) => ({
    id: `correction-${index}-${match.rule.id}`,
    message: match.message,
    shortMessage: match.shortMessage,
    offset: match.offset,
    length: match.length,
    originalText: match.context.text.substring(
      match.context.offset,
      match.context.offset + match.context.length
    ),
    suggestions: match.replacements.map(r => r.value),
    type: categorizeIssueType(match.rule.issueType),
    category: match.rule.category.name,
  }));
}

/**
 * Categorize LanguageTool issue types into our simplified types.
 */
function categorizeIssueType(issueType: string): 'grammar' | 'spelling' | 'style' {
  const lowerType = issueType.toLowerCase();
  
  if (lowerType.includes('misspelling') || lowerType.includes('spelling')) {
    return 'spelling';
  }
  
  if (lowerType.includes('grammar') || lowerType.includes('agreement')) {
    return 'grammar';
  }
  
  return 'style';
} 