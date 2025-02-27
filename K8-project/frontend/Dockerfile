FROM nginx:alpine

# Copy the index.html to NGINX's default static file directory
COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]