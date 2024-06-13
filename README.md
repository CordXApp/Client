# CordX Client

Official Discord App/Client and API for the CordX Services!

---

### Information

- This code is broken down into multiple modules/sub-modules to help with maintainability
- **Self Hosting/Developer** documentation can be found here: [docs/self-hosting.md](./docs/self-hosting.md)
- **Information and algorithm's** for our encryption standards can be found here: [docs/encryption.md](./docs/encryption.md)

---

### Discord Client
Our Discord Client/App is a crucial aspect of our services, it helps with database connections, authentication,
logging and more. All of its necessary files can be found here: [src/client](./src/client/)

---

### API Server
Our API Server is stored locally within in this repo and can be found at here: [src/server](./src/server/) please make sure you
maintain our code standards and layouts when making updates/changes to this server it is a critical part of our services.

> Note: currently the live version of our API Server can be found at: demonstride.cordx.lol

---

### Typings
Our typings also play a vital role in our services and provide a level of safety and inference within the project as a whole,
please maintain, update or add to these typings when needed and use them wherever possible: [src/types](./src/types/)

> Note: typings allow us to define how things should be handled (for example: they will tell typescript/javascript that User IDs should be a string or null)

---







