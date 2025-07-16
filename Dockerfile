
# Використовуємо багатоетапний build для правильної компіляції нативних модулів
FROM node:18-alpine as builder

# Встановлюємо залежності для компіляції
RUN apk add --no-cache python3 make g++ build-base

# Копіюємо package.json
WORKDIR /build
COPY backend/package*.json ./

# Встановлюємо залежності з явною компіляцією better-sqlite3
RUN npm install --build-from-source

# Копіюємо код backend
COPY backend ./

# Етап збірки frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Фінальний етап
FROM node:18-alpine

# Встановлюємо системні залежності, які потрібні в runtime
RUN apk add --no-cache sqlite

# Налаштовуємо робочу директорію
WORKDIR /app

# Копіюємо збудований frontend
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Копіюємо backend та залежності з етапу builder
WORKDIR /app/backend
COPY --from=builder /build/ ./

# Копіюємо package.json для кореневої директорії
WORKDIR /app
COPY package.json ./

# Встановлюємо лише production залежності
ENV NODE_ENV=production

# Відкриваємо порт
EXPOSE 3001

# Запуск застосунку
CMD ["node", "/app/backend/src/index.js"]
