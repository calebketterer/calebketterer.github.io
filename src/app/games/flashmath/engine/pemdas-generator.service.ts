import { Injectable } from '@angular/core';
import { AstGeneratorConfig, MathProblem } from '../core/flashmath.interfaces';
import { FLASHMATH_CONFIG } from '../core/flashmath.constants';
import { MathAstBuilder } from './math-ast.builder';

@Injectable({
  providedIn: 'root'
})
export class PemdasGeneratorService {
  generateProblem(config?: AstGeneratorConfig): MathProblem {
    const activeConfig: AstGeneratorConfig = config || {
      ops: ['+', '-', '*', '/', 'power', 'root', 'frac_exp'],
      minSteps: 3,
      maxSteps: 5,
      maxPowerValue: 144
    };

    const minSteps = activeConfig.minSteps ?? 1;
    const maxSteps = activeConfig.maxSteps;
    const maxPowerValue = activeConfig.maxPowerValue ?? 144;
    const stepCount = MathAstBuilder.randomInt(minSteps, maxSteps, false) || 1;

    const isExpRootOnly =
      activeConfig.ops.every(op => op === 'power' || op === 'root' || op === 'frac_exp') &&
      activeConfig.ops.length > 0;

    let targetAnswer: number;
    if (isExpRootOnly) {
      // Allows up to 15^2 = 225 and sqrt(225) = 15 in Exponents & Roots practice
      const cleanTargets = [-8, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 25, 27, 32, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
      targetAnswer = cleanTargets[Math.floor(Math.random() * cleanTargets.length)];
    } else {
      targetAnswer = MathAstBuilder.randomInt(FLASHMATH_CONFIG.MIN_VAL, FLASHMATH_CONFIG.MAX_VAL);
    }

    const tree = MathAstBuilder.expandValue(targetAnswer, stepCount, activeConfig.ops, maxPowerValue);
    const htmlExpression = MathAstBuilder.toHtml(tree);

    return {
      question: htmlExpression,
      answer: targetAnswer,
      displayExpression: htmlExpression
    };
  }
}