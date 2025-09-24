FROM node as build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm i --force
COPY ./ /app/
ARG configuration=production
RUN npm run build -- --output-path=./dist/out --configuration $configuration

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:stable AS final
EXPOSE 80
COPY --from=build src/dist/angular-app/browser  /usr/share/nginx/html
