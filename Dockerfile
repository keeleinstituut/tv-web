# syntax = docker/dockerfile:1.4.0

FROM node:18.14.2-alpine3.17

ENV APP_ROOT /app
ENV ENTRYPOINT /entrypoint.sh

WORKDIR ${APP_ROOT}
COPY ./ ${APP_ROOT}

RUN yarn install
RUN apk add nginx

RUN <<EOF cat > /etc/nginx/http.d/default.conf
server {
  listen 80;

  error_log  /var/log/nginx/error.log;
  access_log /var/log/nginx/access.log;

  root ${APP_ROOT}/build;

  location / {
    try_files \$uri /index.html;
    gzip_static on;
    add_header X-FRAME-OPTIONS sameorigin;
    add_header Content-Security-Policy "default-src 'self' fonts.googleapis.com fonts.gstatic.com sso.dev.tolkevarav.eki.ee api.dev.tolkevarav.eki.ee; style-src 'self' 'unsafe-inline' fonts.googleapis.com; frame-src 'self' sso.dev.tolkevarav.eki.ee; script-src 'self' 'unsafe-inline';"
    add_header Strict-Transport-Security max-age=86400000
    add_header X-Content-Type-Options nosniff
  }
}
EOF

RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
  ln -sf /dev/stderr /var/log/nginx/error.log

RUN <<EOF cat > ${ENTRYPOINT}
#!/bin/sh
set -e

cd \$APP_ROOT
echo "Creating production build"
yarn build
echo "Finished production build"

echo "Starting..."
exec "\$@"
EOF

RUN chmod +x ${ENTRYPOINT}

RUN echo 'daemon off;' >> /etc/nginx/nginx.conf

CMD ["nginx"]
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]