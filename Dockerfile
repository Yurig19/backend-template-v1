# Usar a imagem oficial do Node.js
FROM node:22

# Definir o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiar os arquivos package.json e package-lock.json para instalar dependências primeiro (cache otimizado)
COPY package.json pnpm-lock.yaml ./

# Instalar o PNPM com o NPM
RUN npm install -g pnpm

# Instalar dependências do projeto
RUN pnpm install

# Copiar o restante do código para dentro do container
COPY . .

# Construir o projeto
RUN pnpm run build

# Garante que o arquivo init.json será copiado corretamente
# RUN mkdir -p dist/src/domain/roles/services && cp src/domain/roles/services/init.json dist/src/domain/roles/services/init.json

# Definir o comando de inicialização
CMD ["pnpm", "run", "start"]
