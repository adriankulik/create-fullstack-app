FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
