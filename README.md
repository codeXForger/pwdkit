# pwdkit

**`pwdkit`** is a lightweight password toolkit that lets you:

- Analyze password strength (Inspired: [passwordmeter](https://passwordmeter.com))
- Get multiple password suggestions with scoring based on customizable rules
- Check if the password matches with the policy that is set

## Installation

```bash
npm install pwdkit
```

## Sample Usage

```
const { PasswordToolkit } = require("pwdkit");

const pwd_instance = new PasswordToolkit({
  minimum_characters: 10,
  containsUpperCase: true,
  containsLowerCase: true,
  containsNumbers: true,
  containsSpecialCharacters: true,
  allowedSpecialCharacters: ["*", "^", "#", "@"],
});

console.log(pwd_instance.analyse("yzmk1W1Q^v"));
// Output: { score: 92 }

console.log(pwd_instance.isPolicySatisfied("yzmk1W1Qv"));
// Output: false

console.log(pwd_instance.getPolicy());
// Output:
{
  minimum_characters: 10,
  containsUpperCase: true,
  containsLowerCase: true,
  containsNumbers: true,
  containsSpecialCharacters: true,
  allowedSpecialCharacters: ["*", "^", "#", "@"],
}

console.log(pwd_instance.getSuggestions(3));
// Example Output:
[
  { password: 'W@q@GJm43t', score: 100 },
  { password: 'g5KxFjh^2V', score: 96 },
  { password: 'U9Y*Q#^4@n', score: 100 }
]
```

### ES Modules (TypeScript or modern bundlers)

```
import { PasswordToolkit } from "pwdkit";

const toolkit = new PasswordToolkit({
  minimum_characters: 12,
  allowedSpecialCharacters: ["!", "%", "#"]
});

const result = toolkit.analyse("MyS3cur3#Pass");
console.log(result); // { score: ... }

const is_pwd_matches_policy = toolkit.isPolicySatisfied("MyS3cur3#Pass"));
// Output: true

console.log(toolkit.getPolicy());
// Output:
{
  minimum_characters: 12,
  containsUpperCase: true,
  containsLowerCase: true,
  containsNumbers: true,
  containsSpecialCharacters: true,
  allowedSpecialCharacters: ["!", "%", "#"],
}

const suggestions = toolkit.getSuggestions(5);
console.log(suggestions);

```

## Options / Policy

Options that can be passed to PasswordToolkit
| Option | Type | Default | Description |
| --------------------------- | ---------- | ------------------------------------- | -------------------------- |
| `minimum_characters` | `number` | `8` | Minimum password length |
| `containsUpperCase` | `boolean` | `true` | Require uppercase letters |
| `containsLowerCase` | `boolean` | `true` | Require lowercase letters |
| `containsNumbers` | `boolean` | `true` | Require digits |
| `containsSpecialCharacters` | `boolean` | `true` | Require special characters |
| `allowedSpecialCharacters` | `string[]` | Default set (`!@#$%^&*()_+[]{}` etc.) | Custom special characters |

All the above keys are optional. if not provided it uses the default one.
