FROM node as build-stage
WORKDIR /app
COPY package*.json /app/
RUN npm i --force
COPY ./ /app/
ARG configuration=production
RUN npm run build -- --output-path=./dist/out --configuration $configuration


FROM nginx:stable AS final
EXPOSE 80
COPY --from=build-stage /app/dist/out/browser  /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
