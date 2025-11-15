FROM nginx:alpine

# Копируем кастомную конфигурацию
COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порт
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]