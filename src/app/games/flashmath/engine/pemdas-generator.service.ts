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
      ops: ['+', '-', '*', '/', '^2', 'sqrt'],
      minSteps: 3,
      maxSteps: 5
    };

    const minSteps = activeConfig.minSteps ?? 1;
    const maxSteps = activeConfig.maxSteps;
    const stepCount = MathAstBuilder.randomInt(minSteps, maxSteps, false) || 1;

    // For Exponents & Roots drill, pick a target that cleanly supports squares/roots
    const isExpRootOnly =
      activeConfig.ops.every(op => op === '^2' || op === 'sqrt') && activeConfig.ops.length > 0;

    const targetAnswer = isExpRootOnly
      ? MathAstBuilder.randomInt(2, 12)
      : MathAstBuilder.randomInt(FLASHMATH_CONFIG.MIN_VAL, FLASHMATH_CONFIG.MAX_VAL);

    const tree = MathAstBuilder.expandValue(targetAnswer, stepCount, activeConfig.ops);
    const htmlExpression = MathAstBuilder.toHtml(tree);

    return {
      question: htmlExpression,
      answer: targetAnswer,
      displayExpression: htmlExpression
    };
  }
}