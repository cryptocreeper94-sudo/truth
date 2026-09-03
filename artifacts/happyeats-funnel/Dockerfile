FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/public /usr/share/nginx/html
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1
