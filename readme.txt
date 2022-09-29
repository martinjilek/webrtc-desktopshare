---- installation and running servers ----

npm install
npm run devStart

npm i -g peer    
peerjs --port 3001 --sslkey ./ssl/key.pem --sslcert ./ssl/cert.pem
// run after ssl install if you want https

---- ssl ---
https://slproweb.com/download/Win64OpenSSL-3_0_5.msi
add to path

openssl genrsa -out key.pem   // private key
openssl req -new -key key.pem -out csr.pem   // certificate signing request
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

---- how to use ----

to host a room, visit this url
https://localhost:3500/host/<name of your room>
if you dont specify name of the room, one will be randomly generated
when room is created, random 4 character password will be generated
you can show / hide this password, or generate a new one

to join a room, visit this url
https://localhost:3500/join/<name of room to be joined>
to join a room, you need to type the correct password
after joining the room, you can choose the source monitor or window to be streamed