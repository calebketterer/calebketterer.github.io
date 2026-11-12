import { Injectable } from '@angular/core';
import { MathProblem } from '../core/flashmath.interfaces';
import { FLASHMATH_CONFIG } from '../core/flashmath.constants';

@Injectable({
  providedIn: 'root'
})
export class AlgebraGeneratorService {
  private randomInt(min: number, max: number): number {
    let val = 0;
    while (val === 0) {
      val = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return val;
  }

  generateProblem(): MathProblem {
    const archetype = Math.floor(Math.random() * 5);
    const xVal = this.randomInt(-7, 7);

    switch (archetype) {
      case 0:
        return this.generateTwoSidedBalance(xVal);
      case 1:
        return this.generateMultiTermCombine(xVal);
      case 2:
        return this.generateParenthesesDistribution(xVal);
      case 3:
        return this.generateExponentIsolation(xVal);
      case 4:
      default:
        return this.generateFractionalAlgebra(xVal);
    }
  }

  private formatCoeff(n: number, variable: string = 'x'): string {
    if (n === 1) return variable;
    if (n === -1) return `-${variable}`;
    return `${n}${variable}`;
  }

  // Archetype 0: Two-Sided Variable Balance -> ax + b = cx + d
  private generateTwoSidedBalance(xVal: number): MathProblem {
    let a = this.randomInt(2, 6) * (Math.random() > 0.5 ? 1 : -1);
    let c = this.randomInt(1, 4) * (Math.random() > 0.5 ? 1 : -1);
    if (a === c) c += 1;

    const b = this.randomInt(-12, 12);
    const leftVal = (a * xVal) + b;
    const d = leftVal - (c * xVal);

    const termA = this.formatCoeff(a);
    const termC = this.formatCoeff(c);
    const signB = b > 0 ? `+ ${b}` : b < 0 ? `- ${Math.abs(b)}` : '';
    const signD = d > 0 ? `+ ${d}` : d < 0 ? `- ${Math.abs(d)}` : '';

    const left = [termA, signB].filter(Boolean).join(' ');
    const right = [termC, signD].filter(Boolean).join(' ');
    const displayExpr = `${left} = ${right}`;

    return { question: displayExpr, answer: xVal, displayExpression: displayExpr };
  }

  // Archetype 1: Multi-Term Combining with explicit operators -> ax + b + cx = d
  private generateMultiTermCombine(xVal: number): MathProblem {
    const a = this.randomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
    const c = this.randomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
    const b = this.randomInt(-10, 10);

    const netCoeff = a + c;
    const rightVal = (netCoeff * xVal) + b;

    const termA = this.formatCoeff(a);
    const termC = this.formatCoeff(Math.abs(c), 'x');
    
    // Explicit operator between constant and second variable term
    const opC = c >= 0 ? '+' : '-';
    const signB = b > 0 ? `+ ${b}` : b < 0 ? `- ${Math.abs(b)}` : '';

    const left = [termA, signB, opC, termC].filter(Boolean).join(' ');
    const displayExpr = `${left} = ${rightVal}`;

    return { question: displayExpr, answer: xVal, displayExpression: displayExpr };
  }

  // Archetype 2: Parentheses Distribution -> a(x + b) = c
  private generateParenthesesDistribution(xVal: number): MathProblem {
    const a = this.randomInt(2, 5) * (Math.random() > 0.5 ? 1 : -1);
    const b = this.randomInt(-8, 8);
    const rightVal = a * (xVal + b);

    const signB = b > 0 ? `+ ${b}` : b < 0 ? `- ${Math.abs(b)}` : '';
    const inner = ['x', signB].filter(Boolean).join(' ');
    const displayExpr = `${a}(${inner}) = ${rightVal}`;

    return { question: displayExpr, answer: xVal, displayExpression: displayExpr };
  }

  // Archetype 3: Exponent Isolation -> ax² + b = c
  private generateExponentIsolation(xVal: number): MathProblem {
    const absX = Math.abs(xVal) === 0 ? 3 : Math.abs(xVal);
    const a = this.randomInt(1, 3);
    const targetSquare = absX ** 2;
    const b = this.randomInt(-10, 10);
    const c = (a * targetSquare) + b;

    const termA = a === 1 ? 'x²' : `${a}x²`;
    const signB = b > 0 ? `+ ${b}` : b < 0 ? `- ${Math.abs(b)}` : '';
    const left = [termA, signB].filter(Boolean).join(' ');
    const displayExpr = `${left} = ${c}`;

    return { question: displayExpr, answer: absX, displayExpression: displayExpr };
  }

  // Archetype 4: Fractional Coefficient -> ax / b = c
  private generateFractionalAlgebra(xVal: number): MathProblem {
    const b = this.randomInt(2, 5);
    const multiplier = this.randomInt(-5, 5);
    const a = b * multiplier;
    if (a === 0) return this.generateFractionalAlgebra(xVal);

    const targetProduct = a * xVal;
    const termA = this.formatCoeff(a);
    const displayExpr = `${termA} / ${b} = ${targetProduct / b}`;

    return { question: displayExpr, answer: xVal, displayExpression: displayExpr };
  }
}