# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero para aprovechar el cache
COPY package*.json ./
RUN npm install

# Copiar código fuente y compilar
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Servir con Nginx
FROM nginx:alpine

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Eliminar archivos por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar archivos compilados desde el builder
COPY --from=builder /app/dist/qams-web/browser /usr/share/nginx/html

# Exponer puerto HTTP
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
