interface CharCounts {
  lowercase: number;
  uppercase: number;
  digits: number;
  special_characters: number;
  consecutiveUppercase: number;
  consecutiveLowercase: number;
  consecutiveDigits: number;
}
export class PasswordToolkit {
  private minimum_characters: number;
  private containsUpperCase: boolean;
  private containsLowerCase: boolean;
  private containsNumbers: boolean;
  private containsSpecialCharacters: boolean;
  private allowedSpecialCharacters: string[];
  private defaultAllowedSpecialCharacters: string[];
  constructor(options?: {
    minimum_characters?: number;
    containsUpperCase?: boolean;
    containsLowerCase?: boolean;
    containsNumbers?: boolean;
    containsSpecialCharacters?: boolean;
    allowedSpecialCharacters?: string[];
  }) {
    this.minimum_characters = options?.minimum_characters || 8;
    this.containsUpperCase =
      options?.containsUpperCase === false ? false : true;
    this.containsLowerCase =
      options?.containsLowerCase === false ? false : true;
    this.containsNumbers = options?.containsNumbers === false ? false : true;
    this.containsSpecialCharacters =
      options?.containsSpecialCharacters === false ? false : true;
    this.defaultAllowedSpecialCharacters = [
      "!",
      "@",
      "#",
      "$",
      "%",
      "^",
      "&",
      "*",
      "(",
      ")",
      "_",
      "+",
      "[",
      "]",
      "{",
      "}",
      "<",
      ">",
      "?",
      ",",
      ".",
    ];
    let given_special_chars = options?.allowedSpecialCharacters || [];
    this.allowedSpecialCharacters =
      Array.isArray(given_special_chars) && given_special_chars.length > 0
        ? given_special_chars
        : [...this.defaultAllowedSpecialCharacters];
  }
  private countDigitsAndSpecialExcludingEnds(input: string): number {
    let count = 0;

    // Exclude first and last character
    const sliced = input.slice(1, -1);

    for (const char of sliced) {
      if (/[0-9]/.test(char) || /[^a-zA-Z0-9]/.test(char)) {
        count++;
      }
    }

    return count;
  }

  private getCharCounts(input: string): CharCounts {
    let lowercase = 0;
    let uppercase = 0;
    let digits = 0;
    let special_characters = 0;
    let consecutiveUppercase = 0;
    let consecutiveLowercase = 0;
    let consecutiveDigits = 0;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (/[a-z]/.test(char)) {
        lowercase++;
        if (i > 0 && /[a-z]/.test(input[i - 1])) {
          consecutiveLowercase++;
        }
      } else if (/[A-Z]/.test(char)) {
        uppercase++;
        if (i > 0 && /[A-Z]/.test(input[i - 1])) {
          consecutiveUppercase++;
        }
      } else if (/[0-9]/.test(char)) {
        digits++;
        if (i > 0 && /[0-9]/.test(input[i - 1])) {
          consecutiveDigits++;
        }
      } else {
        special_characters++;
      }
    }

    return {
      lowercase,
      uppercase,
      digits,
      special_characters,
      consecutiveUppercase,
      consecutiveLowercase,
      consecutiveDigits,
    };
  }
  private areSpecialCharsEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort();
    const sortedB = [...b].sort();

    return sortedA.every((val, i) => val === sortedB[i]);
  }
  private getRequirementMatchCount(
    passwordTxt: string,
    char_counts: CharCounts
  ) {
    let match_count = 0;
    const pwd_length = passwordTxt.length;
    if (pwd_length >= this.minimum_characters) {
      match_count += 1;
    }
    if (this.containsUpperCase && char_counts.uppercase > 0) {
      match_count += 1;
    }
    if (this.containsLowerCase && char_counts.lowercase > 0) {
      match_count += 1;
    }
    if (this.containsNumbers && char_counts.digits > 0) {
      match_count += 1;
    }
    if (this.containsSpecialCharacters && char_counts.special_characters > 0) {
      match_count += 1;
      if (
        this.allowedSpecialCharacters &&
        !this.areSpecialCharsEqual(
          this.allowedSpecialCharacters,
          this.defaultAllowedSpecialCharacters
        )
      ) {
        const containsAllowedSpecialChar = this.allowedSpecialCharacters.some(
          (char) => passwordTxt.includes(char)
        );
        if (containsAllowedSpecialChar) {
          match_count += 1;
        }
      }
    }
    return match_count;
  }
  analyse(passwordTxt: string) {
    let score = 0;
    let deductions = 0;
    let pwd_length = passwordTxt.length;
    let char_counts = this.getCharCounts(passwordTxt);
    let characters_score = pwd_length * 4;
    let uppercase_score = (pwd_length - char_counts.uppercase) * 2;
    let lowercase_score = (pwd_length - char_counts.lowercase) * 2;
    let number_score = char_counts.digits * 4;
    let special_characters_score = char_counts.special_characters * 6;
    let requirement_match_score =
      this.getRequirementMatchCount(passwordTxt, char_counts) * 2;
    let middle_numbers_symbols_score =
      this.countDigitsAndSpecialExcludingEnds(passwordTxt) * 2;
    let only_letters_count =
      char_counts.digits == 0 && char_counts.special_characters == 0
        ? char_counts.uppercase + char_counts.lowercase
        : 0;
    let only_numbers_count =
      char_counts.uppercase == 0 &&
      char_counts.lowercase == 0 &&
      char_counts.special_characters == 0
        ? char_counts.digits
        : 0;
    score =
      characters_score +
      uppercase_score +
      lowercase_score +
      number_score +
      special_characters_score +
      requirement_match_score +
      middle_numbers_symbols_score;
    deductions =
      only_letters_count +
      only_numbers_count +
      char_counts.consecutiveUppercase * 2 +
      char_counts.consecutiveLowercase * 2 +
      char_counts.consecutiveDigits * 2;
    let final_score = score - deductions;
    if (final_score > 100) {
      final_score = 100;
    }
    return { score: final_score };
  }
  private generatePassword(): string {
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberChars = "0123456789";
    const specialChars = this.allowedSpecialCharacters.join("");

    let charPool = "";
    let requiredChars: string[] = [];

    const allowedForEdges: string[] = [];

    if (this.containsLowerCase) {
      charPool += lowerChars;
      requiredChars.push(this.getRandomChar(lowerChars));
      allowedForEdges.push(...lowerChars);
    }
    if (this.containsUpperCase) {
      charPool += upperChars;
      requiredChars.push(this.getRandomChar(upperChars));
      allowedForEdges.push(...upperChars);
    }
    if (this.containsNumbers) {
      charPool += numberChars;
      requiredChars.push(this.getRandomChar(numberChars));
    }
    if (this.containsSpecialCharacters) {
      charPool += specialChars;
      requiredChars.push(this.getRandomChar(specialChars));
    }

    const minLen = this.minimum_characters;
    const remainingLen = Math.max(minLen - requiredChars.length, 2);

    let middleChars: string[] = [];
    for (let i = 0; i < remainingLen; i++) {
      middleChars.push(this.getRandomChar(charPool));
    }

    let combined = [...requiredChars, ...middleChars];
    combined = this.shuffleArray(combined);

    // Ensure first and last char are not number/special if they're disallowed from edges
    const notAllowedAtEdges =
      (this.containsNumbers ? "" : numberChars) +
      (this.containsSpecialCharacters ? "" : specialChars);

    const safeEdgeChars = combined.filter(
      (c) => !notAllowedAtEdges.includes(c) && allowedForEdges.includes(c)
    );
    let firstChar = "";
    let lastChar = "";
    if (safeEdgeChars.length > 0 || allowedForEdges.length > 0) {
      firstChar =
        safeEdgeChars[0] || this.getRandomChar(allowedForEdges.join(""));
      lastChar =
        safeEdgeChars[safeEdgeChars.length - 1] ||
        this.getRandomChar(allowedForEdges.join(""));
    }

    // Remove used first and last
    const middle = combined.filter((c) => c !== firstChar && c !== lastChar);

    return firstChar + middle.join("") + lastChar;
  }

  private getRandomChar(pool: string): string {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getSuggestions(n: number) {
    let results = [];
    for (let i = 0; i < n; i++) {
      let password = this.generatePassword();
      let score = this.analyse(password);
      results.push({ password, score: score.score });
    }
    return results;
  }
}
