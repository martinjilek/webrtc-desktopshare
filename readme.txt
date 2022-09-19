npm install
npm run devStart

npm i -g peer    
peerjs --port 3001

---- ssl ---
https://slproweb.com/download/Win64OpenSSL-3_0_5.msi
add to path

openssl genrsa -out key.pem   // private key
openssl req -new -key key.pem -out csr.pem   // certificate signing request
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem