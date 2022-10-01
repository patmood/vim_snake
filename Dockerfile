## Build pocketbase app
FROM golang:1.19.1 AS BUILDER
ARG ARCH="amd64"

## Build WASM file
RUN wget https://github.com/tinygo-org/tinygo/releases/download/v0.25.0/tinygo_0.25.0_${ARCH}.deb
RUN dpkg -i tinygo_0.25.0_${ARCH}.deb
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
RUN CGO_ENABLED=0 go build -o pocketbase ./cmd/main.go

## Build the production image
FROM scratch
WORKDIR /app/
COPY --from=BUILDER /app/pocketbase .
COPY --from=BUILDER /app/.env .
COPY --from=BUILDER /app/pb_public ./pb_public
EXPOSE 8090
ENTRYPOINT [ "/app/pocketbase", "serve", "--http=0.0.0.0:8090"]

# Run it with arguments "serve --http=0.0.0.0:8090"
