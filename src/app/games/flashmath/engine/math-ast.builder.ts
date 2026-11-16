import { AstOp } from '../core/flashmath.interfaces';

export interface MathNode {
  op: AstOp;
  value?: number;
  coeff?: number;
  exponent?: number;     // Used for 'power' (2, 3, 4) and 'frac_exp' numerator
  rootDegree?: number;   // Used for 'root' (2 = sqrt, 3 = cbrt) and 'frac_exp' denominator
  left?: MathNode;
  right?: MathNode;
}

export class MathAstBuilder {
  static randomInt(min: number, max: number, excludeZero = true): number {
    let val = 0;
    let attempts = 0;
    while (attempts < 50) {
      val = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!excludeZero || val !== 0) return val;
      attempts++;
    }
    return 1;
  }

  private static getPowerDecompositions(target: number, maxPowerValue = 144): { base: number; exp: number }[] {
    const results: { base: number; exp: number }[] = [];
    if (Math.abs(target) < 4 || Math.abs(target) > maxPowerValue) return results;

    for (const exp of [2, 3, 4]) {
      if (exp % 2 === 0 && target < 0) continue;
      const absRoot = Math.round(Math.pow(Math.abs(target), 1 / exp));
      if (absRoot > 1 && Math.pow(absRoot, exp) === Math.abs(target)) {
        if (target < 0) {
          results.push({ base: -absRoot, exp });
        } else {
          results.push({ base: absRoot, exp });
          if (exp % 2 === 0) {
            results.push({ base: -absRoot, exp });
          }
        }
      }
    }
    return results;
  }

  private static getFractionalPowerDecompositions(target: number, maxPowerValue = 144): { base: number; num: number; den: number }[] {
    const results: { base: number; num: number; den: number }[] = [];
    if (target <= 1) return results;

    const candidates: [number, number][] = [
      [2, 3],
      [3, 2],
      [3, 4]
    ];

    for (const [num, den] of candidates) {
      const rootVal = Math.round(Math.pow(target, 1 / num));
      if (rootVal > 1 && Math.pow(rootVal, num) === target) {
        const base = Math.pow(rootVal, den);
        if (base <= maxPowerValue) {
          results.push({ base, num, den });
        }
      }
    }
    return results;
  }

  static expandValue(
    target: number,
    stepsRemaining: number,
    allowedOps: AstOp[] = ['+', '-', '*', '/', 'power', 'root', 'frac_exp'],
    maxPowerValue = 144
  ): MathNode {
    if (stepsRemaining <= 0 || allowedOps.length === 0) {
      return { op: 'VAL', value: target };
    }

    const validOps: AstOp[] = [];
    const powerOptions = allowedOps.includes('power') ? this.getPowerDecompositions(target, maxPowerValue) : [];
    const fracExpOptions = allowedOps.includes('frac_exp') ? this.getFractionalPowerDecompositions(target, maxPowerValue) : [];
    const maxSqrtBase = Math.floor(Math.sqrt(maxPowerValue));

    for (const op of allowedOps) {
      if (op === 'power' && powerOptions.length > 0) {
        validOps.push('power', 'power');
      } else if (op === 'frac_exp' && fracExpOptions.length > 0) {
        validOps.push('frac_exp', 'frac_exp');
      } else if (op === 'root') {
        if ((target >= 2 && target <= maxSqrtBase) || (target <= -2 && target >= -5)) {
          validOps.push('root', 'root');
        }
      } else if (op === '*') {
        if (this.getFactors(target).length > 0) {
          validOps.push('*');
        }
      } else if (op === '/') {
        if (Math.abs(target) <= 15) {
          validOps.push('/');
        }
      } else if (op === '+' || op === '-') {
        validOps.push(op);
      }
    }

    if (validOps.length === 0) {
      return { op: 'VAL', value: target };
    }

    const chosenOp = validOps[Math.floor(Math.random() * validOps.length)];
    const leftSteps = Math.floor(Math.random() * stepsRemaining);
    const rightSteps = stepsRemaining - 1 - leftSteps;

    switch (chosenOp) {
      case 'power': {
        const chosen = powerOptions[Math.floor(Math.random() * powerOptions.length)];
        const childOps = allowedOps.filter(o => o !== 'power' && o !== 'root' && o !== 'frac_exp');
        return {
          op: 'power',
          exponent: chosen.exp,
          left: this.expandValue(chosen.base, stepsRemaining - 1, childOps, maxPowerValue)
        };
      }

      case 'frac_exp': {
        const chosen = fracExpOptions[Math.floor(Math.random() * fracExpOptions.length)];
        const childOps = allowedOps.filter(o => o !== 'power' && o !== 'root' && o !== 'frac_exp');
        return {
          op: 'frac_exp',
          exponent: chosen.num,
          rootDegree: chosen.den,
          left: this.expandValue(chosen.base, stepsRemaining - 1, childOps, maxPowerValue)
        };
      }

      case 'root': {
        const canUseCubeRoot = (target < 0 && Math.abs(target) <= 5) || (target >= 2 && target <= 5 && Math.random() > 0.55);
        const degree = canUseCubeRoot ? 3 : 2;
        const radicand = Math.pow(target, degree);

        const childOps = allowedOps.filter(o => o !== 'root' && o !== 'power' && o !== 'frac_exp');
        return {
          op: 'root',
          rootDegree: degree,
          left: this.expandValue(radicand, stepsRemaining - 1, childOps, maxPowerValue)
        };
      }

      case '+':
      case '-': {
        const magnitude = this.randomInt(1, 14);
        const isPurelyAdditive = allowedOps.every(o => o === '+' || o === '-');

        if (chosenOp === '+') {
          const a = target - magnitude;
          if (a === 0) return this.expandValue(target, stepsRemaining, allowedOps, maxPowerValue);
          return {
            op: '+',
            left: this.expandValue(a, leftSteps, allowedOps, maxPowerValue),
            right: this.expandValue(magnitude, rightSteps, allowedOps, maxPowerValue)
          };
        } else {
          const a = target + magnitude;
          if (a === 0) return this.expandValue(target, stepsRemaining, allowedOps, maxPowerValue);
          // Avoid generating `a - (b + c)` in purely additive drills where parentheses add no order-of-ops value
          const actualLeftSteps = isPurelyAdditive ? stepsRemaining - 1 : leftSteps;
          const actualRightSteps = isPurelyAdditive ? 0 : rightSteps;
          const rightAllowedOps = allowedOps.filter(o => o !== '+' && o !== '-');

          return {
            op: '-',
            left: this.expandValue(a, actualLeftSteps, allowedOps, maxPowerValue),
            right: this.expandValue(
              magnitude,
              actualRightSteps,
              rightAllowedOps.length > 0 ? rightAllowedOps : [],
              maxPowerValue
            )
          };
        }
      }

      case '*': {
        const factors = this.getFactors(target);
        if (factors.length === 0) {
          return this.expandValue(target, stepsRemaining, allowedOps.filter(o => o !== '*'), maxPowerValue);
        }
        const b = factors[Math.floor(Math.random() * factors.length)];
        const a = target / b;
        return {
          op: '*',
          left: this.expandValue(a, leftSteps, allowedOps, maxPowerValue),
          right: this.expandValue(b, rightSteps, allowedOps, maxPowerValue)
        };
      }

      case '/': {
        const divisor = this.randomInt(2, 6) * (Math.random() > 0.5 ? 1 : -1);
        const numerator = target * divisor;
        if (Math.abs(numerator) > 72) {
          return this.expandValue(target, stepsRemaining, allowedOps.filter(o => o !== '/'), maxPowerValue);
        }
        return {
          op: '/',
          left: this.expandValue(numerator, leftSteps, allowedOps, maxPowerValue),
          right: this.expandValue(divisor, rightSteps, allowedOps.filter(o => o !== '/'), maxPowerValue)
        };
      }

      default:
        return { op: 'VAL', value: target };
    }
  }

  private static getFactors(n: number): number[] {
    const abs = Math.abs(n);
    if (abs < 4) return [];
    const factors: number[] = [];
    for (let i = 2; i <= Math.min(abs / 2, 9); i++) {
      if (abs % i === 0) {
        factors.push(i, -i);
      }
    }
    return factors;
  }

  private static getPrecedence(op: AstOp): number {
    switch (op) {
      case 'VAL':
      case 'VAR':
      case '/':
      case 'root':
        return 4;
      case 'power':
      case 'frac_exp':
        return 3;
      case '*':
        return 2;
      case '+':
      case '-':
        return 1;
    }
  }

  /**
   * Serializes the AST into clean HTML without double parentheses or unnecessary negative parens.
   */
  static toHtml(node: MathNode, parentOp?: AstOp, isRightChild = false): string {
    if (node.op === 'VAL') {
      const val = node.value!;
      // Only wrap negative bases of powers/fractional exponents in parens: (-6)^2 vs -6^2
      if (val < 0 && (parentOp === 'power' || parentOp === 'frac_exp')) {
        return `(${val})`;
      }
      return `${val}`;
    }

    if (node.op === 'VAR') {
      const c = node.coeff ?? 1;
      if (c === 1) return 'x';
      if (c === -1) return '-x';
      return `${c}x`;
    }

    if (node.op === '/') {
      const top = this.toHtml(node.left!, '/');
      const bottom = this.toHtml(node.right!, '/');
      return `<span class="math-frac"><span class="frac-num">${top}</span><span class="frac-den">${bottom}</span></span>`;
    }

    if (node.op === 'root') {
      const inner = this.toHtml(node.left!, 'root');
      const deg = node.rootDegree ?? 2;
      const indexHtml = deg > 2 ? `<span class="root-index">${deg}</span>` : '';
      return `<span class="math-sqrt">${indexHtml}<span class="radical-hook" aria-hidden="true"></span><span class="sqrt-radicand">${inner}</span></span>`;
    }

    if (node.op === 'power') {
      // Pass undefined as parentOp so child does NOT self-wrap in parens before we wrap it once
      const baseHtml = this.toHtml(node.left!);
      const needsParens = node.left!.op !== 'VAL' && node.left!.op !== 'VAR';
      const inner = needsParens ? `(${baseHtml})` : baseHtml;
      return `${inner}<sup>${node.exponent ?? 2}</sup>`;
    }

    if (node.op === 'frac_exp') {
      const baseHtml = this.toHtml(node.left!);
      const needsParens = node.left!.op !== 'VAL' && node.left!.op !== 'VAR';
      const inner = needsParens ? `(${baseHtml})` : baseHtml;
      return `${inner}<sup>${node.exponent}/${node.rootDegree}</sup>`;
    }

    const leftHtml = this.toHtml(node.left!, node.op, false);
    const rightHtml = this.toHtml(node.right!, node.op, true);
    const opSymbol = node.op === '*' ? '&times;' : node.op;

    let combined = `${leftHtml} ${opSymbol} ${rightHtml}`;

    if (parentOp && parentOp !== '/' && parentOp !== 'root') {
      const myPrec = this.getPrecedence(node.op);
      const parentPrec = this.getPrecedence(parentOp);

      if (myPrec < parentPrec || (isRightChild && parentOp === '-' && myPrec === parentPrec)) {
        combined = `(${combined})`;
      }
    }

    return combined;
  }
}