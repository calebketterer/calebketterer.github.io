import { Injectable } from '@angular/core';
import { MathProblem, AstGeneratorConfig } from '../core/flashmath.interfaces';
import { MathAstBuilder } from './math-ast.builder';

@Injectable({
  providedIn: 'root'
})
export class AlgebraGeneratorService {
  generateProblem(subjectId: string, config?: AstGeneratorConfig): MathProblem {
    switch (subjectId) {
      // --- 1. ELEMENTARY ALGEBRA ---
      case 'alg_elem_vars':
        return this.genElemVars();
      case 'alg_elem_linear':
        return this.genElemLinear();
      case 'alg_elem_poly':
        return this.genElemPoly();
      case 'alg_elem_quad':
        return this.genElemQuad();

      // --- 2. INTERMEDIATE & COLLEGE ALGEBRA ---
      case 'alg_int_func':
        return this.genIntFunc();
      case 'alg_int_sys':
        return this.genIntSys();
      case 'alg_int_exp':
        return this.genIntExpLog();
      case 'alg_int_rat':
        return this.genIntRatRad();

      // --- 3. LINEAR ALGEBRA ---
      case 'alg_lin_vec':
        return this.genLinVec();
      case 'alg_lin_mat':
        return this.genLinMat();
      case 'alg_lin_trans':
        return this.genLinTrans();
      case 'alg_lin_eigen':
        return this.genLinEigen();

      // --- 4. ABSTRACT ALGEBRA ---
      case 'alg_abs_group':
        return this.genAbsGroup();
      case 'alg_abs_ring':
        return this.genAbsRing();
      case 'alg_abs_field':
        return this.genAbsField();

      // --- 5. BOOLEAN ALGEBRA ---
      case 'alg_bool_logic':
        return this.genBoolLogic();
      case 'alg_bool_gates':
        return this.genBoolGates();

      default:
        return this.genElemLinear();
    }
  }

  // --- ELEMENTARY ---
  private genElemVars(): MathProblem {
    const variant = Math.random();
    if (variant < 0.33) {
      // Combine like terms: ax + b - cx + d
      const a = MathAstBuilder.randomInt(2, 9);
      const c = MathAstBuilder.randomInt(1, a - 1);
      const b = MathAstBuilder.randomInt(-10, 15, true);
      const d = MathAstBuilder.randomInt(-10, 15, true);
      const x = MathAstBuilder.randomInt(-5, 5, true);
      const ans = (a - c) * x + (b + d);
      return {
        question: `SIMPLIFY & EVALUATE FOR x = ${x}`,
        answer: ans,
        displayExpression: `${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} - ${c}x ${d >= 0 ? '+ ' + d : '- ' + Math.abs(d)}`
      };
    } else if (variant < 0.66) {
      // Exponent substitution: a x^2 - bx + c
      const a = MathAstBuilder.randomInt(1, 4);
      const b = MathAstBuilder.randomInt(2, 8);
      const c = MathAstBuilder.randomInt(-5, 10, true);
      const x = MathAstBuilder.randomInt(-3, 4, true);
      const ans = a * x * x - b * x + c;
      return {
        question: `EVALUATE QUADRATIC PHRASE FOR x = ${x}`,
        answer: ans,
        displayExpression: `${a}x<sup>2</sup> - ${b}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`
      };
    } else {
      // Distributive property: a(bx + c)
      const a = MathAstBuilder.randomInt(2, 5);
      const b = MathAstBuilder.randomInt(1, 4);
      const c = MathAstBuilder.randomInt(-6, 8, true);
      const x = MathAstBuilder.randomInt(-4, 5, true);
      const ans = a * (b * x + c);
      return {
        question: `EVALUATE DISTRIBUTIVE FORM FOR x = ${x}`,
        answer: ans,
        displayExpression: `${a}(${b}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)})`
      };
    }
  }

  private genElemLinear(): MathProblem {
    const variant = Math.random();
    if (variant < 0.5) {
      // Fractional coefficient equation: (a/b)x = c
      const b = MathAstBuilder.randomInt(2, 5);
      const ans = MathAstBuilder.randomInt(-8, 12, true);
      const a = MathAstBuilder.randomInt(1, 4);
      const rhs = (a * ans) / b;
      // Ensure integer division check or adjust
      const adjustedAns = b * MathAstBuilder.randomInt(-3, 4, true);
      const finalRhs = (a * adjustedAns) / b;
      return {
        question: 'SOLVE FRACTIONAL LINEAR EQUATION FOR x',
        answer: adjustedAns,
        displayExpression: `(${a}/${b})x = ${finalRhs}`
      };
    } else {
      // Multi-step parenthesis linear: a(x + b) = c(x + d)
      const x = MathAstBuilder.randomInt(-7, 9, true);
      const a = MathAstBuilder.randomInt(2, 4);
      const b = MathAstBuilder.randomInt(1, 5);
      const c = MathAstBuilder.randomInt(1, a - 1);
      const d = a * x + a * b - c * x;
      return {
        question: 'SOLVE MULTI-STEP EQUATION FOR x',
        answer: x,
        displayExpression: `${a}(x + ${b}) = ${c}x + ${d}`
      };
    }
  }

  private genElemPoly(): MathProblem {
    const variant = Math.random();
    if (variant < 0.5) {
      // Polynomial subtraction: (ax^2 + bx + c) - (dx^2 + ex + f) evaluated at x
      const a = MathAstBuilder.randomInt(2, 5);
      const b = MathAstBuilder.randomInt(1, 6);
      const d = MathAstBuilder.randomInt(1, a - 1);
      const e = MathAstBuilder.randomInt(1, 4);
      const x = MathAstBuilder.randomInt(1, 3);
      const p1 = a * x * x + b * x;
      const p2 = d * x * x + e * x;
      return {
        question: `EVALUATE DIFFERENCE POLYNOMIAL AT x = ${x}`,
        answer: p1 - p2,
        displayExpression: `(${a}x<sup>2</sup> + ${b}x) - (${d}x<sup>2</sup> + ${e}x)`
      };
    } else {
      // Binomial expansion coefficient of middle term: (x + a)(x + b)
      const a = MathAstBuilder.randomInt(1, 6);
      const b = MathAstBuilder.randomInt(1, 6);
      return {
        question: 'FIND COEFFICIENT OF x IN EXPANDED PRODUCT',
        answer: a + b,
        displayExpression: `(x + ${a})(x + ${b})`
      };
    }
  }

  private genElemQuad(): MathProblem {
    const variant = Math.random();
    if (variant < 0.5) {
      // Discriminant calculation: b^2 - 4ac
      const a = MathAstBuilder.randomInt(1, 4);
      const b = MathAstBuilder.randomInt(2, 8);
      const c = MathAstBuilder.randomInt(1, 5);
      const disc = b * b - 4 * a * c;
      return {
        question: 'FIND THE DISCRIMINANT (b<sup>2</sup> - 4ac)',
        answer: disc,
        displayExpression: `${a}x<sup>2</sup> + ${b}x + ${c} = 0`
      };
    } else {
      // Completing the square target constant: find c such that x^2 + bx + c is a square
      const half = MathAstBuilder.randomInt(2, 7);
      const b = 2 * half;
      return {
        question: 'FIND VALUE OF c TO COMPLETE THE SQUARE (x<sup>2</sup> + bx + c)',
        answer: half * half,
        displayExpression: `x<sup>2</sup> + ${b}x + c`
      };
    }
  }

  // --- INTERMEDIATE & COLLEGE ---
  private genIntFunc(): MathProblem {
    const variant = Math.random();
    if (variant < 0.5) {
      // Composite function: f(g(x)) where f(x) = ax + b, g(x) = cx + d
      const a = MathAstBuilder.randomInt(2, 4);
      const b = MathAstBuilder.randomInt(1, 5);
      const c = MathAstBuilder.randomInt(1, 3);
      const d = MathAstBuilder.randomInt(1, 4);
      const x = MathAstBuilder.randomInt(1, 3);
      const inner = c * x + d;
      const ans = a * inner + b;
      return {
        question: `FIND (f &compfn; g)(${x}) FOR f(x)=${a}x+${b}, g(x)=${c}x+${d}`,
        answer: ans,
        displayExpression: `f(g(${x}))`
      };
    } else {
      // Inverse function evaluation: if f(x) = ax + b, find f^-1(target)
      const a = MathAstBuilder.randomInt(2, 5);
      const b = MathAstBuilder.randomInt(1, 9);
      const x = MathAstBuilder.randomInt(1, 5);
      const target = a * x + b;
      return {
        question: `FIND f<sup>-1</sup>(${target}) FOR f(x) = ${a}x + ${b}`,
        answer: x,
        displayExpression: `f<sup>-1</sup>(${target})`
      };
    }
  }

  private genIntSys(): MathProblem {
    // Cramer's rule / 2x2 system determinant ratio or substitution
    const x = MathAstBuilder.randomInt(1, 6);
    const y = MathAstBuilder.randomInt(1, 6);
    const a1 = MathAstBuilder.randomInt(1, 3);
    const b1 = MathAstBuilder.randomInt(1, 3);
    const c1 = a1 * x + b1 * y;
    const a2 = MathAstBuilder.randomInt(1, 3);
    const b2 = MathAstBuilder.randomInt(2, 5);
    const c2 = a2 * x + b2 * y;
    return {
      question: 'SOLVE SYSTEM FOR y',
      answer: y,
      displayExpression: `${a1}x + ${b1}y = ${c1}, ${a2}x + ${b2}y = ${c2}`
    };
  }

  private genIntExpLog(): MathProblem {
    const variant = Math.random();
    if (variant < 0.5) {
      // Exponential growth/decay evaluation: A = P * b^(t)
      const p = MathAstBuilder.randomInt(100, 500);
      const b = 2;
      const t = MathAstBuilder.randomInt(2, 4);
      return {
        question: `COMPUTE EXPONENTIAL GROWTH A = ${p}(${b})<sup>${t}</sup>`,
        answer: p * Math.pow(b, t),
        displayExpression: `${p} &times; ${b}<sup>${t}</sup>`
      };
    } else {
      // Logarithm property: log_b(x) + log_b(y) = log_b(xy)
      const b = 3;
      const x = 3;
      const y = 9;
      return {
        question: `EVALUATE: log<sub>${b}</sub>(${x}) + log<sub>${b}</sub>(${y})`,
        answer: 3, // log3(3) + log3(9) = 1 + 2 = 3
        displayExpression: `log<sub>3</sub>(3) + log<sub>3</sub>(9)`
      };
    }
  }

  private genIntRatRad(): MathProblem {
    // Rationalizing denominator or solving radical equation sqrt(x + a) = b
    const ans = MathAstBuilder.randomInt(2, 8);
    const a = MathAstBuilder.randomInt(1, 10);
    const b = Math.sqrt(ans + a);
    const validB = Number.isInteger(b) ? b : Math.sqrt(ans + a);
    return {
      question: 'SOLVE RADICAL EQUATION FOR x',
      answer: ans,
      displayExpression: `<span class="math-sqrt"><span class="radical-hook" aria-hidden="true"></span><span class="sqrt-radicand">x + ${a}</span></span> = ${Math.round(Math.sqrt(ans + a))}`
    };
  }

  // --- LINEAR ALGEBRA ---
  private genLinVec(): MathProblem {
    const a = MathAstBuilder.randomInt(2, 5);
    const u1 = MathAstBuilder.randomInt(1, 4);
    const u2 = MathAstBuilder.randomInt(1, 4);
    const v1 = MathAstBuilder.randomInt(1, 4);
    const v2 = MathAstBuilder.randomInt(1, 4);
    return {
      question: `FIND NORM SQUARED OF VECTOR SUM ||u + v||<sup>2</sup>`,
      answer: Math.pow(u1 + v1, 2) + Math.pow(u2 + v2, 2),
      displayExpression: `u = ⟨${u1}, ${u2}⟩, v = ⟨${v1}, ${v2}⟩`
    };
  }

  private genLinMat(): MathProblem {
    const k = MathAstBuilder.randomInt(2, 6);
    const a = MathAstBuilder.randomInt(1, 4);
    const d = MathAstBuilder.randomInt(1, 4);
    // Scalar multiplication determinant det(k * A) = k^2 * det(A)
    const baseDet = a * d;
    return {
      question: 'FIND DETERMINANT OF SCALED MATRIX det(kA)',
      answer: k * k * baseDet,
      displayExpression: `k = ${k}, A = [${a}, 0; 0, ${d}]`
    };
  }

  private genLinTrans(): MathProblem {
    const matrixEntry = MathAstBuilder.randomInt(2, 5);
    const vecX = MathAstBuilder.randomInt(1, 3);
    const vecY = MathAstBuilder.randomInt(1, 3);
    return {
      question: 'FIND FIRST COMPONENT OF T(v)',
      answer: matrixEntry * vecX + matrixEntry * vecY,
      displayExpression: `T(x,y) = (${matrixEntry}x + ${matrixEntry}y, y)`
    };
  }

  private genLinEigen(): MathProblem {
    const l1 = MathAstBuilder.randomInt(2, 5);
    const l2 = MathAstBuilder.randomInt(6, 9);
    return {
      question: 'FIND PRODUCT OF EIGENVALUES (Determinant)',
      answer: l1 * l2,
      displayExpression: `A = [${l1}, 0; 0, ${l2}]`
    };
  }

  // --- ABSTRACT ALGEBRA ---
  private genAbsGroup(): MathProblem {
    const mod = 11;
    const g = MathAstBuilder.randomInt(2, 5);
    return {
      question: `FIND ORDER OF ELEMENT IN Z<sub>${mod}</sub><sup>*</sup> (Smallest k > 0 s.t. g<sup>k</sup> ≡ 1)`,
      answer: mod - 1 === 10 ? 10 : 5,
      displayExpression: `element ${g} mod ${mod}`
    };
  }

  private genAbsRing(): MathProblem {
    const a = MathAstBuilder.randomInt(2, 5);
    const b = MathAstBuilder.randomInt(1, 4);
    return {
      question: 'EVALUATE DEGREE OF PRODUCT POLYNOMIAL IN Z[x]',
      answer: 2,
      displayExpression: `deg((${a}x + ${b})(x<sup>2</sup> + 1))`
    };
  }

  private genAbsField(): MathProblem {
    const p = 7;
    const a = MathAstBuilder.randomInt(2, 5);
    let order = 1;
    let curr = a;
    while (curr !== 1 && order < 10) {
      curr = (curr * a) % p;
      order++;
    }
    return {
      question: `FIND MULTIPLICATIVE ORDER OF ${a} IN F<sub>${p}</sub>`,
      answer: order,
      displayExpression: `ord(${a}) mod ${p}`
    };
  }

  // --- BOOLEAN ALGEBRA ---
  private genBoolLogic(): MathProblem {
    const val = Math.random() > 0.5 ? 1 : 0;
    const notVal = val === 1 ? 0 : 1;
    return {
      question: 'EVALUATE DE MORGAN\'S LAW: ¬(p ∨ q)',
      answer: 0,
      displayExpression: `¬(1 ∨ ${val})`
    };
  }

  private genBoolGates(): MathProblem {
    return {
      question: 'EVALUATE XOR GATE: (1 ⊕ 0)',
      answer: 1,
      displayExpression: `1 ⊕ 0`
    };
  }
}