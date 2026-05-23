# Usamos a imagem oficial do Python na versão Alpine
FROM python:3.11-alpine

# Define a pasta de trabalho dentro do contêiner
WORKDIR /app

# Copia o arquivo de dependências primeiro (otimiza o cache do Docker)
COPY requirements.txt .

# Instala as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do seu código Flask para dentro do contêiner
COPY . .

# Expõe a porta padrão do Flask
EXPOSE 5000

# Comando para rodar o seu app Flask
CMD ["python", "app.py"]