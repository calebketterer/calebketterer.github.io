import { AstOp } from '../core/flashmath.interfaces';

export interface MathNode {
  op: AstOp;
  value?: number;
  coeff?: number;
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

  /**
   * Recursively expands a target integer into a randomized math tree constrained by `allowedOps`.
   */
  static expandValue(
    target: number,
    stepsRemaining: number,
    allowedOps: AstOp[] = ['+', '-', '*', '/', '^2']
  ): MathNode {
    if (stepsRemaining <= 0 || allowedOps.length === 0) {
      return { op: 'VAL', value: target };
    }

    const validOps: AstOp[] = [];

    for (const op of allowedOps) {
      if (op === '^2') {
        if (target > 0 && Number.isInteger(Math.sqrt(target)) && Math.sqrt(target) > 1) {
          validOps.push('^2', '^2');
        }
      } else if (op === 'sqrt') {
        if (target >= 2 && target <= 12) {
          validOps.push('sqrt', 'sqrt');
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
      case '^2': {
        const root = Math.sqrt(target) * (Math.random() > 0.5 ? 1 : -1);
        const childOps = allowedOps.filter(o => o !== '^2');
        return {
          op: '^2',
          left: this.expandValue(root, stepsRemaining - 1, childOps)
        };
      }

      case 'sqrt': {
        const radicand = target * target;
        const childOps = allowedOps.filter(o => o !== 'sqrt');
        return {
          op: 'sqrt',
          left: this.expandValue(radicand, stepsRemaining - 1, childOps)
        };
      }

      case '+': {
        const b = this.randomInt(-12, 12);
        const a = target - b;
        if (a === 0) return this.expandValue(target, stepsRemaining, allowedOps);
        return {
          op: '+',
          left: this.expandValue(a, leftSteps, allowedOps),
          right: this.expandValue(b, rightSteps, allowedOps)
        };
      }

      case '-': {
        const b = this.randomInt(-12, 12);
        const a = target + b;
        if (a === 0) return this.expandValue(target, stepsRemaining, allowedOps);
        return {
          op: '-',
          left: this.expandValue(a, leftSteps, allowedOps),
          right: this.expandValue(b, rightSteps, allowedOps)
        };
      }

      case '*': {
        const factors = this.getFactors(target);
        if (factors.length === 0) {
          return this.expandValue(target, stepsRemaining, allowedOps.filter(o => o !== '*'));
        }
        const b = factors[Math.floor(Math.random() * factors.length)];
        const a = target / b;
        return {
          op: '*',
          left: this.expandValue(a, leftSteps, allowedOps),
          right: this.expandValue(b, rightSteps, allowedOps)
        };
      }

      case '/': {
        const divisor = this.randomInt(2, 6) * (Math.random() > 0.5 ? 1 : -1);
        const numerator = target * divisor;
        if (Math.abs(numerator) > 60) {
          return this.expandValue(target, stepsRemaining, allowedOps.filter(o => o !== '/'));
        }
        return {
          op: '/',
          left: this.expandValue(numerator, leftSteps, allowedOps),
          right: this.expandValue(divisor, rightSteps, allowedOps.filter(o => o !== '/'))
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
      case 'sqrt':
        return 4;
      case '^2':
        return 3;
      case '*':
        return 2;
      case '+':
      case '-':
        return 1;
    }
  }

  static toHtml(node: MathNode, parentOp?: AstOp, isRightChild = false): string {
    if (node.op === 'VAL') {
      const val = node.value!;
      if (val < 0 && parentOp && parentOp !== '/' && parentOp !== 'sqrt' && (isRightChild || parentOp === '^2')) {
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

    if (node.op === 'sqrt') {
      const inner = this.toHtml(node.left!, 'sqrt');
      return `<span class="math-sqrt">&radic;<span class="sqrt-radicand">${inner}</span></span>`;
    }

    if (node.op === '^2') {
      const baseHtml = this.toHtml(node.left!, '^2');
      const needsParens = node.left!.op !== 'VAL' && node.left!.op !== 'VAR';
      const inner = needsParens ? `(${baseHtml})` : baseHtml;
      return `${inner}<sup>2</sup>`;
    }

    const leftHtml = this.toHtml(node.left!, node.op, false);
    const rightHtml = this.toHtml(node.right!, node.op, true);
    const opSymbol = node.op === '*' ? '&times;' : node.op;

    let combined = `${leftHtml} ${opSymbol} ${rightHtml}`;

    if (parentOp && parentOp !== '/' && parentOp !== 'sqrt') {
      const myPrec = this.getPrecedence(node.op);
      const parentPrec = this.getPrecedence(parentOp);

      if (myPrec < parentPrec || (isRightChild && parentOp === '-' && myPrec === parentPrec)) {
        combined = `(${combined})`;
      }
    }

    return combined;
  }
}