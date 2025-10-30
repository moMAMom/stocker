# PayPay Project - Essential Commands for Development

This is a multi-service Docker-based project with Node.js backend, React frontend, Python analysis engine, and PostgreSQL database.

## Project Setup and Running

### Quick Start (All Services with Docker)
```powershell
docker-compose up -d  # Background mode
# Or
docker-compose up     # With logs visible
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- API Docs: http://localhost:3000/api-docs

### Environment Setup
```powershell
cp .env.example .env
# Edit .env with your database URL and API keys
```

## Development (Individual Services)

### Backend (Express.js + TypeScript)
```powershell
cd backend
npm install
npm run dev  # Development server with hot reload
npm test     # Run unit tests
npm run lint # ESLint check
npx prisma migrate dev  # Database migrations
npx prisma studio      # Database browser
```

### Frontend (React + Vite + TypeScript)
```powershell
cd frontend
npm install
npm run dev  # Vite dev server (port 5173)
npm test     # Vitest unit tests
npm run build # Production build
npm run preview # Preview production build
```

### Analysis Engine (Python)
```powershell
cd analysis
python -m venv venv
venv\Scripts\activate.ps1  # On Windows PowerShell
pip install -r requirements.txt
python -m src.app    # Start FastAPI server (port 5000)
pytest               # Run Python tests
```

## Testing and Quality

### All Test Suites
```powershell
# Backend
tests: cd backend && npm test

# Frontend
tests: cd frontend && npm test

# Python
tests: cd analysis && pytest

# E2E
tests: cd frontend && npx playwright test
```

### Code Quality
```powershell
# Backend linting and formatting
cd backend && npm run lint && npx prettier --check 'src/**/*.{ts,tsx}' && npx tsc --noEmit

# Frontend linting and formatting
cd frontend && npm run lint && npx prettier --check 'src/**/*.{ts,tsx}' && npx tsc --noEmit

# Python type checking
cd analysis && mypy src/ --ignore-missing-imports
```

## Database Operations

### Development Database
```powershell
# Reset and migrate
docker-compose down -v  # Destroy volumes
doncer-compose up -d db # Start database
cd backend && npx prisma db push --accept-data-loss
npx prisma db seed    # Seed initial data

# View data
npx prisma studio
```

### Production Database
```powershell
# Migration only (no data loss)
npx prisma migrate deploy
```

## Deployment Preparation

### Build All Images
```powershell
doncker-compose build --no-cache
```

### Production Environment
```powershell
cp .env.production.example .env.production
# Configure production settings
doncker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Clean Restart
```powershell
docker-compose down -v
docker-compose up -d
```

### Logs
```powershell
docker-compose logs        # All services
docker-compose logs backend
docker-compose logs frontend
docker-compose logs analysis
```

### Database Reset
```powershell
docker-compose down -v
rm -rf backend/prisma/migrations
docker-compose up -d db
cd backend && npx prisma db push
```

## Windows PowerShell Specific
- Use PowerShell instead of bash
- Path separators use backslash \ 
- File paths use absolute paths when needed: d:\code\PayPay
- Activation: venv\Scripts\activate.ps1
- No sudo needed - Docker Desktop handles elevation

## Git Workflow
```powershell
git checkout -b feature/your-feature
git add .
git commit -m '[feat] Add new feature'
git push origin feature/your-feature
```

## Task Completion Checklist
After implementing features:
1. Run tests: npm test (all services)
2. Lint: npm run lint (all services)
3. Format: prettier check
4. Type check: tsc --noEmit
5. Update docs if needed
6. Commit with proper message
7. Test in browser (if UI changes)
8. Update 01-project-progress.md