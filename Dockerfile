# Етап збірки frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Етап збірки backend
FROM node:18-alpine as backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
# Встановлюємо необхідні інструменти для компіляції нативних модулів
RUN apk add --no-cache python3 make g++ 
RUN npm install
COPY backend ./

# Фінальний етап
FROM node:18-alpine
WORKDIR /app

# Копіювання збудованого frontend
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Копіювання backend
COPY --from=backend-build /app/backend ./backend

# Копіювання package.json для кореневої директорії
COPY package.json ./

# Налаштування змінних оточення
ENV NODE_ENV=production
ENV PORT=3001

# Відкриття порту
EXPOSE 3001

# Запуск застосунку
CMD ["node", "/app/backend/src/index.js"]
