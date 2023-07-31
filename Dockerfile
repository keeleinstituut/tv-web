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
yarn build > /dev/null 2>&1
echo "Finished production build"

echo "Starting..."
exec "\$@"
EOF

RUN chmod +x ${ENTRYPOINT}

RUN echo 'daemon off;' >> /etc/nginx/nginx.conf

CMD ["nginx"]
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]