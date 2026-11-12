import { Injectable } from '@angular/core';
import { MathProblem } from '../core/flashmath.interfaces';
import { FLASHMATH_CONFIG } from '../core/flashmath.constants';

@Injectable({
  providedIn: 'root'
})
export class DmasGeneratorService {
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateProblem(): MathProblem {
    const ops = ['+', '-', '*', '/'];
    const op = ops[this.randomInt(0, ops.length - 1)];
    let a = this.randomInt(FLASHMATH_CONFIG.MIN_VAL, FLASHMATH_CONFIG.MAX_VAL);
    let b = this.randomInt(FLASHMATH_CONFIG.MIN_VAL, FLASHMATH_CONFIG.MAX_VAL);

    // Recursive validation ensuring whole number result between -50 and 50
    if (op === '/') {
      if (b === 0) b = 1;
      const multiplier = this.randomInt(-10, 10);
      a = b * multiplier; // Guarantees exact integer division
    } else if (op === '*') {
      a = this.randomInt(-10, 10);
      b = this.randomInt(-5, 5);
    }

    let answer = 0;
    switch (op) {
      case '+': answer = a + b; break;
      case '-': answer = a - b; break;
      case '*': answer = a * b; break;
      case '/': answer = Math.round(a / b); break;
    }

    // Recursively retry if bounds violated or division decimals occurred
    if (answer < FLASHMATH_CONFIG.MIN_VAL || answer > FLASHMATH_CONFIG.MAX_VAL || !Number.isInteger(answer)) {
      return this.generateProblem();
    }

    const displayExpression = `${a} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${b}`;
    return {
      question: displayExpression,
      answer: answer,
      displayExpression: displayExpression
    };
  }
}