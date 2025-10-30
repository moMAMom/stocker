# Code Style and Conventions for PayPay Project

## Naming Conventions

### Files
- **Files**: kebab-case (e.g., `error-handler.ts`, `stock-service.ts`)
- **Folders**: lowercase with dashes if needed (e.g., `src/controllers`)

### Code Elements
- **Classes**: PascalCase (e.g., `StockService`, `AnalysisController`)
- **Functions**: camelCase (e.g., `calculateMovingAverage`, `getStockById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `API_PORT`)
- **Types/Interfaces**: PascalCase (e.g., `IStock`, `StockData`, `ApiResponse`)
- **Variables**: camelCase (e.g., `stockList`, `apiResponse`)
- **Properties**: camelCase (e.g., `stockPrice`, `analysisResults`)

## Language Usage

### Comments and Documentation
- **Comments**: Japanese (e.g., `// 株式データを取得する`)
- **Documentation**: Japanese (e.g., README.md, code docs)
- **String literals in code**: English unless user-facing
- **Error messages**: Japanese for user-facing, English for internal

## Code Structure Rules

### File Size Limits
- **Maximum lines per file**: 1000
- **Single responsibility**: Each file/class/function should have one purpose

### Import/Export
- **Import order**: 
  1. Third-party libraries
  2. Local modules (using relative paths)
  3. Types/interfaces at top
- **Export**: Default export for components, named exports for utilities

### Error Handling
- **Custom Errors**: Extend `AppError` with statusCode, message, details
- **Async functions**: Use `asyncHandler` wrapper for Express routes
- **Validation**: Use Joi/Middleware validation for input sanitization

## TypeScript Specific

### Type Safety
- **Strict mode**: Enabled in tsconfig.json
- **No any**: Avoid `any` type, use proper types or `unknown`
- **Interface vs Type**: Use `interface` for objects, `type` for unions
- **Optional properties**: Use `?:` for optional props
- **Generic types**: Use when appropriate for reusability

### Interfaces
```typescript
interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  analysisResult?: AnalysisResult;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}
```

## Python Specific (Analysis Engine)

### Naming
- **Files**: snake_case (e.g., `data_fetch.py`, `indicators.py`)
- **Functions**: snake_case (e.g., `calculate_rsi`, `fetch_stock_data`)
- **Classes**: PascalCase (e.g., `StockAnalyzer`, `DataFetcher`)
- **Constants**: UPPER_SNAKE_CASE

### Type Hints
- **Required**: Use type hints for all function parameters and returns
- **Complex types**: Import from `typing` (List, Dict, Optional, etc.)
```python
from typing import List, Dict, Optional

def get_multiple_stocks(symbols: List[str]) -> Dict[str, Optional[Dict]]:
    # Implementation
```

## Testing Conventions

### Test File Structure
- **Location**: `tests/` folder in each service
- **Naming**: `*.test.ts` for backend/frontend, `test_*.py` for analysis
- **Coverage target**: 80% minimum

### Test Patterns
- **Unit tests**: Test individual functions/classes
- **Integration tests**: Test API endpoints, database operations
- **E2E tests**: Full user flows with Playwright

## Design Patterns

### Backend
- **Controller-Service pattern**: Controllers handle HTTP, services handle business logic
- **Repository pattern**: Abstract data access through service layers
- **Middleware chain**: Authentication, validation, logging in order

### Frontend
- **Container/Presentational**: Separate data logic from UI
- **Custom hooks**: Encapsulate reusable logic
- **Redux best practices**: Actions, reducers, selectors

### Analysis Engine
- **Facade pattern**: Single entry point for complex operations
- **Strategy pattern**: Different analysis algorithms
- **Observer pattern**: For real-time updates

## Commit Conventions

### Format
```
[<type>] <subject>

<body>
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `docs`: Documentation changes
- `style`: Styling/formatting
- `test`: Tests
- `chore`: Maintenance tasks

### Examples
```
[feat] Add stock price monitoring service
[fix] Correct RSI calculation in indicators.py
[refactor] Simplify stock controller validation
[docs] Update API endpoint documentation
```

## API Design

### RESTful conventions
- **Resource naming**: Plural nouns (e.g., `/api/stocks`, `/api/analysis`)
- **HTTP methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Response format**: Consistent `{success, data, error, pagination}`

### Error codes
- **400**: Bad request (validation error)
- **401**: Unauthorized
- **404**: Not found
- **429**: Too many requests (rate limited)
- **500**: Internal server error

## Security Guidelines

### Input Validation
- **Sanitize all inputs**: Use middleware validators
- **SQL injection**: Prevented by Prisma ORM
- **XSS**: Sanitize user inputs, use React's built-in protection

### Authentication & Authorization
- **JWT tokens**: For session management
- **Rate limiting**: Implemented per route
- **CORS**: Properly configured for cross-origin requests

## Performance

### Code Level
- **Avoid N+1 queries**: Use Prisma's include/relations
- **Lazy loading**: Load data only when needed
- **Caching**: Implement Redis/memory cache for expensive operations

### Infrastructure
- **Docker optimization**: Multi-stage builds, minimal images
- **Database indexing**: Index frequently queried fields
- **Connection pooling**: Database connection optimization