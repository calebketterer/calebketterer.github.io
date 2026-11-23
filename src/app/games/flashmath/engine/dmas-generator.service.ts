import { Injectable } from '@angular/core';
import { MathProblem } from '../core/flashmath.interfaces';
import { FLASHMATH_CONFIG } from '../core/flashmath.constants';

@Injectable({
  providedIn: 'root'
})
export class DmasGeneratorService {
  private randomInt(min: number, max: number): number {
    let val = 0;
    while (val === 0) { // Avoid 0 to prevent waste/redundant space
      val = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return val;
  }

  generateProblem(): MathProblem {
    const ops = ['+', '-', '*', '/'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = this.randomInt(FLASHMATH_CONFIG.MIN_VAL, FLASHMATH_CONFIG.MAX_VAL);
    let b = this.randomInt(FLASHMATH_CONFIG.MIN_VAL, FLASHMATH_CONFIG.MAX_VAL);

    if (op === '/') {
      const multiplier = this.randomInt(-8, 8);
      a = b * multiplier;
    } else if (op === '*') {
      a = this.randomInt(-10, 10);
      b = this.randomInt(-5, 5);
      if (a === 0) a = 2;
      if (b === 0) b = 2;
    }

    let answer = 0;
    switch (op) {
      case '+': answer = a + b; break;
      case '-': answer = a - b; break;
      case '*': answer = a * b; break;
      case '/': answer = Math.round(a / b); break;
    }

    if (answer < FLASHMATH_CONFIG.MIN_VAL || answer > FLASHMATH_CONFIG.MAX_VAL || !Number.isInteger(answer)) {
      return this.generateProblem();
    }

    // Clean up formatting so '--' never shows up (e.g., 5 - -3 becomes 5 - (-3))
    let displayExpression = `${a} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${b}`;
    if (b < 0 && op === '-') {
      displayExpression = `${a} - (${b})`;
    }

    return {
      question: displayExpression,
      answer: answer,
      displayExpression: displayExpression
    };
  }
}