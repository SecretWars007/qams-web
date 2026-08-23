# Servidor web Nginx con soporte HTTPS
FROM nginx:alpine

# Generar certificados SSL/TLS autofirmados para localhost/desarrollo
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/qams.key \
    -out /etc/nginx/ssl/qams.crt \
    -subj "/C=ES/ST=State/L=City/O=QAMS/OU=QA/CN=localhost" && \
    chmod 600 /etc/nginx/ssl/qams.key && \
    chmod 644 /etc/nginx/ssl/qams.crt

# Copiar configuración de Nginx con SSL/TLS habilitado
COPY nginx.conf /etc/nginx/nginx.conf

# Limpiar archivos por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar archivos compilados de Angular
COPY dist/qams-web/browser /usr/share/nginx/html

# Exponer puertos HTTP (80) y HTTPS (443)
EXPOSE 80 443

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
