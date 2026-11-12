import { Injectable } from '@angular/core';
import { MathProblem } from '../core/flashmath.interfaces';
import { FLASHMATH_CONFIG } from '../core/flashmath.constants';

@Injectable({
  providedIn: 'root'
})
export class PemdasGeneratorService {
  private randomInt(min: number, max: number): number {
    let val = 0;
    while (val === 0) {
      val = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return val;
  }

  generateProblem(): MathProblem {
    // Clean multi-step PEMDAS with exponents, grouped operations, and safe negative formatting
    const base = this.randomInt(-4, 4);
    const n1 = this.randomInt(2, 6);
    const n2 = this.randomInt(2, 6);
    const n3 = this.randomInt(-8, 8);
    const n4 = this.randomInt(2, 5);
    const numerator = n4 * this.randomInt(2, 4);

    const formattedN3 = n3 < 0 ? `(-${Math.abs(n3)})` : `${n3}`;
    const opN3 = n3 < 0 ? '-' : '+';
    
    // Expression: base² + (n1 × n2) ± |n3| - (numerator ÷ n4)
    const rawEvalExpr = `${Math.pow(base, 2)} + (${n1} * ${n2}) ${opN3} ${Math.abs(n3)} - (${numerator} / ${n4})`;
    const displayExpr = `${base}² + (${n1} × ${n2}) ${opN3} ${Math.abs(n3)} - (${numerator} ÷ ${n4})`;

    try {
      const answer = Math.round(Function(`return ${rawEvalExpr}`)());

      if (isNaN(answer) || !Number.isInteger(answer) || answer < FLASHMATH_CONFIG.MIN_VAL || answer > FLASHMATH_CONFIG.MAX_VAL) {
        return this.generateProblem();
      }

      return {
        question: rawEvalExpr,
        answer: answer,
        displayExpression: displayExpr
      };
    } catch {
      return this.generateProblem();
    }
  }
}