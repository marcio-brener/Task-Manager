# Usamos o servidor Nginx na versão Alpine (super leve)
FROM nginx:stable-alpine

# Copiamos todos os seus arquivos do Bootstrap/HTML para a pasta do servidor
COPY . /usr/share/nginx/html

# Expõe a porta padrão do servidor web
EXPOSE 80