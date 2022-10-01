## Build pocketbase app
FROM golang:1.19.1 AS BUILDER

## Build WASM file
RUN wget https://github.com/tinygo-org/tinygo/releases/download/v0.25.0/tinygo_0.25.0_arm64.deb
RUN dpkg -i tinygo_0.25.0_arm64.deb
RUN apt-get install -y make
WORKDIR /app/pb_public
WORKDIR /app/
COPY ./ ./
RUN make build

## Build front end
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn
RUN yarn
RUN yarn build

# Build server
RUN go build -o pocketbase ./cmd/main.go

## Build the production image
FROM alpine:3.16.2
WORKDIR /app/
COPY --from=BUILDER /app/pocketbase .
COPY --from=BUILDER /app/pb_public ./pb_public
EXPOSE 8090
# ENTRYPOINT [ "/app/pocketbase" ]
CMD ./pocketbase serve --http=0.0.0.0:8090

