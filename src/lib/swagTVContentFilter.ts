/**
 * SwagTV PG-13 Content Filter
 * Conservative 90s MTV standards for safety
 */
export interface FilterResult {
  allowed: boolean;
  confidence: number;
  reason?: string;
  suggestions?: string[];
}

export interface FilterConfig {
  strictMode: boolean;
  customBlocklist: string[];
  allowEducational: boolean;
}

export class SwagTVContentFilter {
  private blockedWords: Set<string>;
  private suspiciousPatterns: RegExp[];
  private educationalExceptions: Set<string>;
  constructor(
    private config: FilterConfig = {
      strictMode: true,
      customBlocklist: [],
      allowEducational: true,
    },
  ) {
    this.initializeBlocklists();
  }

  private initializeBlocklists(): void {
    const coreBlocked = [
      'nude',
      'naked',
      'sex',
      'sexual',
      'porn',
      'erotic',
      'breast',
      'genitals',
      'intimate',
      'seduce',
      'orgasm',
      'masturbat',
      'fetish',
      'bdsm',
      'kill',
      'murder',
      'death',
      'dead',
      'blood',
      'gore',
      'violent',
      'torture',
      'stab',
      'shoot',
      'gun',
      'weapon',
      'knife',
      'bomb',
      'explode',
      'suicide',
      'hang',
      'strangle',
      'beat up',
      'assault',
      'fight',
      'war',
      'battle',
      'drug',
      'cocaine',
      'heroin',
      'meth',
      'marijuana',
      'weed',
      'high',
      'stoned',
      'drunk',
      'alcohol',
      'beer',
      'wine',
      'vodka',
      'whiskey',
      'smoke',
      'cigarette',
      'fuck',
      'shit',
      'damn',
      'hell',
      'bitch',
      'ass',
      'crap',
      'piss',
      'bastard',
      'whore',
      'slut',
      'gay',
      'lesbian',
      'homo',
      'fag',
      'scary',
      'horror',
      'nightmare',
      'monster',
      'demon',
      'devil',
      'evil',
      'ghost',
      'zombie',
      'corpse',
      'skeleton',
      'witch',
      'occult',
      'racist',
      'nazi',
      'hitler',
      'slave',
      'terrorism',
      'terrorist',
      'isis',
      'hate',
      'discrimination',
      'supremacist',
      'kkk',
      'child',
      'kid',
      'minor',
      'teen',
      'young',
      'school',
      'student',
      'baby',
      'infant',
      'underage',
      'lolita',
      'daddy',
      'mommy',
      ...this.config.customBlocklist,
    ];
    this.blockedWords = new Set(coreBlocked.map((w) => w.toLowerCase()));

    this.educationalExceptions = new Set([
      'educational documentary',
      'science',
      'nature',
      'space',
      'astronomy',
      'biology',
      'chemistry',
      'physics',
      'history',
      'geography',
      'mathematics',
      'art',
      'music',
      'literature',
      'technology',
      'engineering',
    ]);

    this.suspiciousPatterns = [
      /\b\d{1,2}[-\s]?year[-\s]?old\b/i,
      /\bunder(age|aged)\b/i,
      /\b(meet|chat|talk).*private\b/i,
      /\b(send|show).*pic(ture)?s?\b/i,
      /\bno.*parent(s)?\b/i,
      /\bsecret\b.*\bfrom\b/i,
    ];
  }

  filterContent(content: string): FilterResult {
    const normalized = content.toLowerCase().trim();
    const blocked = this.checkBlockedWords(normalized);
    if (!blocked.allowed) return blocked;
    const patterns = this.checkSuspiciousPatterns(content);
    if (!patterns.allowed) return patterns;
    if (this.config.allowEducational && this.isEducationalContent(normalized)) {
      return {
        allowed: true,
        confidence: 0.9,
        reason: 'Educational content exception applied',
      };
    }
    const sentiment = this.analyzeSentiment(content);
    return {
      allowed: true,
      confidence: sentiment.confidence,
      suggestions: this.generateSafeSuggestions(content),
    };
  }

  private checkBlockedWords(content: string): FilterResult {
    const words = content.split(/\s+/);
    for (const word of words) {
      const clean = word.replace(/[^\w]/g, '').toLowerCase();
      if (this.blockedWords.has(clean)) {
        return {
          allowed: false,
          confidence: 1.0,
          reason: `Contains blocked content: "${clean}"`,
          suggestions: this.getSaferAlternatives(clean),
        };
      }
    }
    return { allowed: true, confidence: 1.0 };
  }

  private checkSuspiciousPatterns(content: string): FilterResult {
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        return {
          allowed: false,
          confidence: 0.8,
          reason: 'Content contains potentially inappropriate patterns',
          suggestions: [
            'Try describing scenes without age references',
            'Focus on general activities rather than specific interactions',
          ],
        };
      }
    }
    return { allowed: true, confidence: 1.0 };
  }

  private isEducationalContent(content: string): boolean {
    for (const exception of this.educationalExceptions) {
      if (content.includes(exception)) return true;
    }
    return false;
  }

  private analyzeSentiment(content: string): { confidence: number } {
    const positiveWords = [
      'beautiful',
      'amazing',
      'wonderful',
      'peaceful',
      'happy',
      'fun',
      'exciting',
    ];
    const negativeWords = [
      'dark',
      'scary',
      'sad',
      'angry',
      'disturbing',
      'creepy',
    ];
    const words = content.toLowerCase().split(/\s+/);
    let positive = 0;
    let negative = 0;
    words.forEach((w) => {
      if (positiveWords.includes(w)) positive++;
      if (negativeWords.includes(w)) negative++;
    });
    const confidence = negative > positive ? 0.3 : 0.9;
    return { confidence };
  }

  private getSaferAlternatives(word: string): string[] {
    const alternatives: Record<string, string[]> = {
      violent: ['energetic', 'dynamic', 'action-packed'],
      scary: ['mysterious', 'intriguing', 'suspenseful'],
      dark: ['nighttime', 'shadowy', 'dimly lit'],
      fight: ['competition', 'contest', 'challenge'],
      weapon: ['tool', 'equipment', 'device'],
      blood: ['red liquid', 'paint', 'ketchup'],
      dead: ['still', 'motionless', 'sleeping'],
      kill: ['stop', 'end', 'finish'],
    };
    return (
      alternatives[word] || [ // eslint-disable-line security/detect-object-injection
        'Consider a different approach',
        'Try more positive language',
      ]
    );
  }

  private generateSafeSuggestions(_content: string): string[] {
    const suggestions = [
      'Add more positive descriptive words',
      'Focus on beautiful scenery or landscapes',
      'Include friendly characters or animals',
      'Describe peaceful or fun activities',
      'Add educational elements about science or nature',
    ];
    return suggestions.slice(0, 3);
  }

  monitorLiveContent(
    content: string,
    callback: (result: FilterResult) => void,
  ): void {
    const result = this.filterContent(content);
    if (!result.allowed) {
      callback(result);
    } else if (result.confidence < 0.5) {
      callback({
        allowed: false,
        confidence: result.confidence,
        reason: 'Content flagged for manual review',
        suggestions: result.suggestions,
      });
    }
  }

  updateConfig(newConfig: Partial<FilterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeBlocklists();
  }

  getFilterStats(): { totalBlocked: number; categories: string[] } {
    return {
      totalBlocked: this.blockedWords.size,
      categories: [
        'Nudity/Sexual',
        'Violence/Gore',
        'Substances',
        'Vulgar Language',
        'Disturbing',
        'Hate/Discrimination',
        'Predatory',
      ],
    };
  }
}

export const swagTVFilter = new SwagTVContentFilter({
  strictMode: true,
  customBlocklist: [],
  allowEducational: true,
});

export function quickContentCheck(content: string): boolean {
  const result = swagTVFilter.filterContent(content);
  return result.allowed && result.confidence > 0.7;
}

export function emergencyContentBlock(reason: string): FilterResult {
  return {
    allowed: false,
    confidence: 1.0,
    reason: `EMERGENCY BLOCK: ${reason}`,
    suggestions: [
      'Please try a completely different prompt',
      'Focus on positive, family-friendly content',
    ],
  };
}
