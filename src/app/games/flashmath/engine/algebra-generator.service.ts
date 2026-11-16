import { Injectable } from '@angular/core';
import { MathProblem } from '../core/flashmath.interfaces';
import { MathAstBuilder, MathNode } from './math-ast.builder';

@Injectable({
  providedIn: 'root'
})
export class AlgebraGeneratorService {
  generateProblem(): MathProblem {
    const xVal = MathAstBuilder.randomInt(-7, 7);
    const totalSteps = MathAstBuilder.randomInt(3, 5);

    // Build an AST starting with a variable node `coeff * x` and wrapping it in random operations
    const baseCoeff = MathAstBuilder.randomInt(-4, 4);
    let leftNode: MathNode = { op: 'VAR', coeff: baseCoeff };
    let currentEval = baseCoeff * xVal;

    // Distribute remaining steps between wrapping the X side and expanding the RHS
    const leftWrapSteps = MathAstBuilder.randomInt(2, totalSteps - 1);
    const rightExpandSteps = totalSteps - leftWrapSteps;

    for (let i = 0; i < leftWrapSteps; i++) {
      const wrapType = MathAstBuilder.randomInt(1, 4);

      if (wrapType === 1) {
        // Add a constant or sub-expression
        const addVal = MathAstBuilder.randomInt(-10, 10);
        leftNode = { op: '+', left: leftNode, right: { op: 'VAL', value: addVal } };
        currentEval += addVal;
      } else if (wrapType === 2) {
        // Subtract a constant
        const subVal = MathAstBuilder.randomInt(-10, 10);
        leftNode = { op: '-', left: leftNode, right: { op: 'VAL', value: subVal } };
        currentEval -= subVal;
      } else if (wrapType === 3 && Math.abs(currentEval) <= 18) {
        // Multiply entire left expression (creates nested parentheses like 2(3x - 4))
        const mult = MathAstBuilder.randomInt(2, 4) * (Math.random() > 0.5 ? 1 : -1);
        leftNode = Math.random() > 0.5
          ? { op: '*', left: { op: 'VAL', value: mult }, right: leftNode }
          : { op: '*', left: leftNode, right: { op: 'VAL', value: mult } };
        currentEval *= mult;
      } else {
        // Wrap entire left expression as numerator of a horizontal fraction
        const div = MathAstBuilder.randomInt(2, 5);
        if (currentEval % div === 0) {
          leftNode = { op: '/', left: leftNode, right: { op: 'VAL', value: div } };
          currentEval = currentEval / div;
        } else {
          // Adjust with an offset first so division stays clean
          const remainder = ((currentEval % div) + div) % div;
          const offset = div - remainder;
          leftNode = {
            op: '/',
            left: { op: '+', left: leftNode, right: { op: 'VAL', value: offset } },
            right: { op: 'VAL', value: div }
          };
          currentEval = (currentEval + offset) / div;
        }
      }
    }

    // Expand the right-hand side into 1–2 operations using default AST ops
    const rightNode = MathAstBuilder.expandValue(currentEval, rightExpandSteps);

    const leftHtml = MathAstBuilder.toHtml(leftNode);
    const rightHtml = MathAstBuilder.toHtml(rightNode);
    const displayExpr = `${leftHtml} = ${rightHtml}`;

    return {
      question: displayExpr,
      answer: xVal,
      displayExpression: displayExpr
    };
  }
}