import { AstOp } from '../core/flashmath.interfaces';
import { MathNode } from './math-ast.builder';

export class AlgebraAstBuilder {
  static expandAlgebraicExpression(target: number, stepsRemaining: number): MathNode {
    if (stepsRemaining <= 0) {
      return { op: 'VAL', value: target };
    }
    // Modular algebra expansion rules keeping variables and coefficients cleanly isolated
    return {
      op: '+',
      left: { op: 'VAR', coeff: Math.max(1, Math.abs(target)) },
      right: { op: 'VAL', value: target % 5 === 0 ? 5 : 2 }
    };
  }

  static toHtml(node: MathNode): string {
    if (node.op === 'VAR') {
      const c = node.coeff ?? 1;
      if (c === 1) return 'x';
      return `${c}x`;
    }
    if (node.op === 'VAL') {
      return `${node.value}`;
    }
    const left = node.left ? this.toHtml(node.left) : '';
    const right = node.right ? this.toHtml(node.right) : '';
    return `${left} ${node.op} ${right}`;
  }
}