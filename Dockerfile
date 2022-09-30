## Build the WASM file
FROM tinygo/tinygo:0.25.0 AS tinygobuilder
RUN apt-get install -y make
WORKDIR /app/pb_public
WORKDIR /app/
COPY .env .env
COPY ./src/go ./src/go
COPY ./Makefile ./Makefile
CMD make build

## Build pocketbase app
FROM golang:1.19.1 AS gobuilder
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn
WORKDIR /app/
COPY ./ ./
RUN yarn
RUN yarn build
COPY --from=tinygobuilder /app/pb_public ./pb_public
RUN go build -o pocketbase ./cmd/main.go

# Temp steps
EXPOSE 8090
CMD ./pocketbase serve

## Run the app
# FROM alpine:3.16  
# RUN apk --no-cache add ca-certificates
# WORKDIR /app/
# COPY --from=gobuilder /app/pocketbase ./
# COPY --from=gobuilder /app/pb_public ./pb_public
# EXPOSE 8090
# CMD ./pocketbase serve

# "sh: ./pocketbase: not found" when the last image. Maybe the pocketbase build isnt compatible with alpine? not sure