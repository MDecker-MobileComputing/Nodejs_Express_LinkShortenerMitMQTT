# Offizielles Base Image für Webserver "nginx", siehe https://hub.docker.com/_/nginx/
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

# Expore HTTP port, to be mapped to port 9000 on the host
EXPOSE 80
