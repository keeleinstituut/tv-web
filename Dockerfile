# syntax = docker/dockerfile:1.4.0

# ============================================================================
# Stage 1: Builder - Build React application
# ============================================================================
FROM node:18.14.2-alpine3.17 AS builder

ENV REACT_APP_GATEWAY_BASE /gateway

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY public ./public
COPY src ./src
COPY tsconfig.json ./
COPY patches ./patches
COPY .eslintrc.json ./
COPY .prettierrc.json ./

RUN yarn build

# ============================================================================
# Stage 2: Runtime - Minimal production image
# ============================================================================
FROM node:18.14.2-alpine3.17

ENV APP_ROOT /app
ENV ENTRYPOINT /entrypoint.sh
ENV START /start.sh

WORKDIR ${APP_ROOT}

COPY --from=builder /app/build ./build

COPY auth-server/package.json auth-server/yarn.lock ./auth-server/

RUN cd auth-server && yarn install --frozen-lockfile --production && \
    yarn cache clean

COPY auth-server/src ./auth-server/src

RUN apk add --no-cache nginx curl && \
    rm -rf /var/cache/apk/*

RUN chown -R nginx:nginx ${APP_ROOT}/build && \
    chown -R node:node ${APP_ROOT}/auth-server

RUN echo 'daemon off;' >> /etc/nginx/nginx.conf

RUN <<EOF cat > /etc/nginx/http.d/default.conf
server {
  listen 80;

  error_log  /var/log/nginx/error.log;
  access_log /var/log/nginx/access.log;

  large_client_header_buffers 4 32k;
  proxy_buffers 16 16k;
  proxy_buffer_size 32k;
  client_max_body_size 100M;

  root ${APP_ROOT}/build;

  location / {
    try_files \$uri /index.html;
    gzip_static on;
  }

  location /gateway/ {
    proxy_pass http://localhost:8000/;
  }
}
EOF

RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

RUN <<EOF cat > ${ENTRYPOINT}
#!/bin/sh

echo "Starting..."
exec "\$@"
EOF

RUN <<EOF cat > ${START}
#!/bin/sh
echo "Starting auth-server as node user"
su -s /bin/sh node -c "cd \$APP_ROOT/auth-server && yarn start" &

echo "Starting nginx"
nginx &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit \$?
EOF

RUN <<EOF cat > /startup-probe.sh
#!/bin/sh
curl -f http://localhost:8000/healthz || exit 1
curl -f http://localhost/ || exit 1
EOF

RUN <<EOF cat > /readiness-probe.sh
#!/bin/sh
# Readiness probe: Check if services are ready (Redis/AMQP connected)
curl -f http://localhost:8000/healthz/ready || exit 1
EOF

RUN <<EOF cat > /liveness-probe.sh
#!/bin/sh
# Liveness probe: Check if services are alive
curl -f http://localhost:8000/healthz || exit 1
curl -f http://localhost/ || exit 1
EOF


RUN chmod +x ${ENTRYPOINT} ${START} /startup-probe.sh /readiness-probe.sh /liveness-probe.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/start.sh"]
