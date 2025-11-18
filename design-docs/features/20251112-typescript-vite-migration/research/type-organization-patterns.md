# TypeScript Type Organization Patterns Research

**Date:** 2024-11-18
**Research Question:** Should types be defined in the same file as implementation (co-located) or in separate *Types.ts files?
**Research Method:** Perplexity AI reasoning with "best practices 2025"
**Context:** Large TypeScript codebase migration with Action-Based File Organization (files named by operations/transformations)

---

## Executive Summary

**Key Finding:** Use a **HYBRID strategy** aligned with Action-Based File Organization principles:
- **Extract shared types** (domain entities, API contracts) to `*Types.ts` files
- **Co-locate operation-specific types** (internal helpers, discriminated unions) with their operations

**Impact on Epic 4:** The design correctly proposed `citationTypes.ts` and `validationTypes.ts` for shared types, but should clarify that operation-specific types stay co-located.

**Decision Criteria:**

| Criteria | Extract to `*Types.ts` | Co-locate in operation file |
|----------|------------------------|----------------------------|
| Used by 2+ modules? | ✅ YES | ❌ NO |
| Domain entity? | ✅ YES | ❌ NO |
| Public API contract? | ✅ YES | ❌ NO |
| Prevents circular deps? | ✅ YES | ❌ NO |
| Operation-internal helper? | ❌ NO | ✅ YES |
| Discriminated union for single operation? | ❌ NO | ✅ YES |

---

## The Core Principle: Separation of Concerns

The fundamental tension in type organization revolves around **proximity** (keeping related code together) versus **abstraction** (separating concerns).

In action-based file organization where files represent operations and transformations, types serve dual roles:
1. **Implementation details** (how an operation works internally)
2. **Contractual interfaces** (what data flows between modules)

**From research:**
> "For large-scale TypeScript codebases using action-based file organization, the choice between co-locating types and extracting them to separate files is a strategic architectural decision that directly impacts your ability to maintain clear separation between data contracts and operations."

---

## Co-location vs Separation Strategy

### When to Co-locate Types

**Co-location makes sense for:**
- **Private, operation-specific types** that exist solely to support a single action's internal logic
- **Implementation details** tightly coupled to a specific transformation
- **Small, contained operations** where the type and its usage are trivially discoverable

**Example:**

```typescript
// operations/order/submitOrder.ts
import type { IOrder } from '../../contracts/order.contract';

// ✅ Co-located: Only used within this operation
type OrderValidationError =
    | { type: 'INVALID_ITEMS'; items: string[] }
    | { type: 'INSUFFICIENT_INVENTORY'; productId: string }
    | { type: 'PAYMENT_DECLINED' };

// ✅ Co-located: Utility type specific to this transformation
type OrderWithDefaults = Required<Pick<IOrder, 'status' | 'createdAt'>>;

export const submitOrder = (order: IOrder): IOrder | OrderValidationError => {
    // Implementation uses co-located types
    return order;
};
```

### When to Separate Types

**Separation into dedicated files makes sense for:**
- **Shared data contracts** used across multiple operations or modules
- **Domain entities** that represent core business concepts independent of any single operation
- **Types that define module boundaries** and public API contracts
- **Types prone to circular dependency issues** where extraction creates a dependency hierarchy

**Example:**

```typescript
// contracts/user.contract.ts
export interface IUser {
    id: string;
    name: string;
    email: string;
}

export interface IAuthCredentials {
    email: string;
    password: string;
}

export interface IAuthToken {
    token: string;
    expiresAt: number;
}

// operations/user/authenticate.ts
import type { IAuthCredentials, IAuthToken } from '../../contracts/user.contract';

export const authenticate = (credentials: IAuthCredentials): IAuthToken => {
    // Operation references only the contract
    return {
        token: 'token',
        expiresAt: Date.now() + 3600000,
    };
};

// operations/user/createUser.ts
import type { IUser } from '../../contracts/user.contract';

export const createUser = (data: { name: string; email: string }): IUser => {
    // Another operation uses the same contract
    return {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
    };
};
```

---

## Preventing Circular Dependencies

**Circular dependencies emerge when:**
- Operation A depends on types defined with Operation B
- Operation B depends on types from Operation A
- Result: Circular import cycle that breaks module resolution

**The three-layer type organization pattern prevents this:**

```typescript
// Layer 1: Pure data contracts - ZERO dependencies on operations
// types/domain.ts
export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthToken {
    token: string;
    expiresAt: number;
}

// Layer 2: Operations - depends ONLY on Layer 1
// operations/authenticate.ts
import type { User, AuthToken } from '../types/domain';

export function authenticate(credentials: { email: string; password: string }): AuthToken {
    return { token: 'abc', expiresAt: Date.now() };
}

// Layer 3: Request/response contracts for API boundaries
// types/api.ts
import type { User } from './domain';

export interface CreateUserRequest {
    email: string;
    password: string;
}

export interface CreateUserResponse {
    success: boolean;
    user?: User;
}
```

**Key principle:** Establish clear dependency directionality:
- **Contracts depend on nothing**
- **Operations depend on contracts**
- **Never the reverse**

---

## Trade-offs Analysis

| Dimension | Co-located | Separated |
|-----------|-----------|-----------|
| **Discoverability** | High (type and implementation visible together) | Lower (requires navigating between files) |
| **Maintainability** | Easier for small, isolated operations | Easier as codebase scales (centralized governance) |
| **Module Boundaries** | Blurred (hard to distinguish public from private) | Clear (explicit exports create contracts) |
| **Circular Dependencies** | High risk (tight coupling encourages cycles) | Low risk (forced hierarchical organization) |
| **Code Reuse** | Discouraged (discoverability requires duplication) | Encouraged (shared types in shared files) |
| **Refactoring Safety** | Lower (dependencies unclear) | Higher (explicit imports show impact) |
| **Team Coordination** | Required less (local changes are local) | Required more (shared types need consensus) |

---

## Recommended Pattern for Action-Based Organization

### Contract-First Separation Strategy

**Structure:**

```plaintext
src/
  contracts/          # Shared data contracts (WHAT)
    user.contract.ts
    order.contract.ts
  operations/         # Transformations (HOW)
    user/
      authenticate.ts
      createUser.ts
    order/
      submitOrder.ts
```

**Example implementation:**

```typescript
// contracts/user.contract.ts
export interface IUser {
    id: string;
    name: string;
    email: string;
}

export interface IAuthCredentials {
    email: string;
    password: string;
}

// operations/user/authenticate.ts
import type { IAuthCredentials, IAuthToken } from '../../contracts/user.contract';

export const authenticate = (credentials: IAuthCredentials): IAuthToken => {
    // Pure operation implementation - references only the contract
    return {
        token: 'token',
        expiresAt: Date.now() + 3600000,
    };
};
```

**From research:**
> "This architecture explicitly separates contracts (WHAT the data looks like) from operations (HOW we transform it). Multiple operations can compose the same contracts without circular dependencies."

---

## Shared vs Module-Specific Types

### Create Centralized `types/` Folder For

- **Domain entities** (User, Order, Product)
- **Request/response schemas** (API contracts)
- **Enum definitions and constants**
- **Types that define system-wide invariants**

### Keep Co-located Types For

- **Generic type parameters** specific to an operation
- **Utility types** created via transformations (Partial, Pick, etc.)
- **Internal helper types** used only within a function
- **Discriminated union branches** for operation-specific handlers

**Example:**

```typescript
// operations/order/submitOrder.ts
import type { IOrder } from '../../contracts/order.contract';

// ✅ Module-specific: only used within this operation
type OrderValidationError =
    | { type: 'INVALID_ITEMS'; items: string[] }
    | { type: 'INSUFFICIENT_INVENTORY'; productId: string }
    | { type: 'PAYMENT_DECLINED' };

// ✅ Utility type: specific transformation for this operation
type OrderWithDefaults = Required<Pick<IOrder, 'status' | 'createdAt'>>;

export const submitOrder = (order: IOrder): IOrder | OrderValidationError => {
    // Implementation
    return order;
};
```

---

## Organizing Large Type Hierarchies

**Use barrel file exports** to simplify consumption:

```typescript
// types/index.ts
export type * from './user.contract';
export type * from './order.contract';
export type * from './payment.contract';

// operations/order/submitOrder.ts
import type { IOrder, IPaymentMethod, IOrderStatus } from '../../types';
```

**From research:**
> "This creates a single entry point while maintaining clear internal organization."

---

## Circular Dependency Prevention Checklist

When refactoring codebase:

- **Extract types that are referenced by multiple operations** into contracts/
- **Never import operations from type files** (one-way dependency)
- **Use dependency inversion principle**: operations depend on contracts, contracts depend on nothing
- **Run TypeScript with circular dependency detection** (ESLint plugin or dpdm tool)
- **Establish convention** where `contracts/` and `types/` directories are "shared infrastructure" consumed unidirectionally

---

## Application to Citation-Manager Migration

### Phase 1: Extract Shared Domain Types

```typescript
// types/citationTypes.ts - SHARED across multiple modules
export type LinkScope = 'internal' | 'external';
export type ValidationStatus = 'valid' | 'warning' | 'error';

export interface LinkObject {
  target: { path: string; anchor: string | null };
  validation: ValidationMetadata;
}

// types/validationTypes.ts - SHARED across validation components
export interface ValidationResult {
  status: ValidationStatus;
  suggestions: string[];
}
```

### Phase 2: Co-locate Operation-Specific Types

```typescript
// core/ContentExtractor/analyzeEligibility.ts
import type { LinkObject } from '../../types/citationTypes';

// ✅ Co-located: Only used by analyzeEligibility operation
export interface EligibilityAnalysis {
  eligible: boolean;
  reason: string;
  strategy: string;
}

export function analyzeEligibility(link: LinkObject): EligibilityAnalysis {
  // Implementation uses shared LinkObject + local EligibilityAnalysis
}
```

### Phase 3: Update Operations to Import from Contracts

```typescript
// Before (circular dependency risk)
import { LinkObject } from './ContentExtractor';
import { ValidationResult } from './CitationValidator';

// After (contract-first, no cycles)
import type { LinkObject } from '../../types/citationTypes';
import type { ValidationResult } from '../../types/validationTypes';
```

---

## Epic 4 Implementation Guidance

### Story 4.1: Type Library Design

**Create these shared type files:**

```typescript
// types/citationTypes.ts
export type LinkScope = 'internal' | 'external';
export type ValidationStatus = 'valid' | 'warning' | 'error';
export interface LinkObject { /* ... */ }

// types/validationTypes.ts
export interface ValidationResult { /* ... */ }
export interface FileValidationSummary { /* ... */ }
export type ResolutionResult = /* discriminated union */

// types/contentExtractorTypes.ts
export interface ExtractedContent { /* ... */ }
export interface OutgoingLinksExtractedContent { /* ... */ }
```

**Co-locate operation-specific types:**

```typescript
// analyzeEligibility.ts - keep internal type here
interface EligibilityAnalysis { /* ... */ }

// generateContentId.ts - no types needed (pure function)

// ContentExtractor.ts - internal processing types stay here
type ProcessingState = 'pending' | 'processing' | 'complete';
```

---

## Key Takeaways

1. **Hybrid strategy is optimal** - extract shared types, co-locate operation-specific types
2. **Circular dependencies are prevented** through contract-first separation
3. **Action-Based Organization benefits** from clear WHAT (contracts) vs HOW (operations) separation
4. **Epic 4 design is mostly correct** but needs clarification on co-location criteria
5. **ARCHITECTURE.md needs minor updates** to document decision criteria

---

## References

**Perplexity AI Research Output** (2024-11-18):
- Query: "TypeScript type organization best practices 2025 co-located vs separate files"
- Sources cited:
  - TypeScript Best Practices 2025 (dev.to)
  - TypeScript Adoption Best Practices (javascript.plainenglish.io)
  - AWS Prescriptive Guidance (TypeScript CDI IaC)
  - Organizing TypeScript Projects (blog.stackademic.com)
  - Common Type Definitions Patterns (webshinetech community)

**Related Documentation:**
- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - Action-Based File Organization principles
- [ARCHITECTURE-PRINCIPLES.md](../../../ARCHITECTURE-PRINCIPLES.md) - Data-First Design principles
- [Epic 4 Design](../user-stories/epic4-systematic-conversion/epic4-systematic-conversion-design.md) - Type library section
