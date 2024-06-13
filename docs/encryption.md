## Encryption and Decryption Algorithm
Our application uses the AES-256-CTR encryption algorithm for securing sensitive information. This section provides an overview of how encryption and decryption processes are implemented. Currently the outlined encryption methods are used primarily for entity api keys/secrets, supported entities are: `Admin, User, Organization`.

### Encryption Process
**Initialization**: The AES-256-CTR algorithm is initialized using a 256-bit encryption key and a counter (CTR) mode. The encryption key is derived from an environment variable and must be a `32 Byte` hexadecimal string. The counter is initialized to a buffer of 16 bytes set to zero, ensuring the same starting point for each encryption process.

**Buffer Conversion**: The plaintext (the data to be encrypted) is converted into a buffer using UTF-8 encoding. This conversion facilitates the encryption process on binary data.

**Encryption**: The plaintext buffer is encrypted using the AES-256-CTR algorithm. This process involves the transformation of the plaintext buffer into a ciphertext buffer, which is a scrambled version of the original data that can only be understood if decrypted.

**Concatenation and Encoding**: The encrypted data is then concatenated with any additional data generated during the encryption process (such as the final block of data). This concatenated buffer is converted into a hexadecimal string, which represents the final encrypted data.

### Decryption Process
**Initialization**: Similar to the encryption process, the AES-256-CTR algorithm is initialized with the same 256-bit encryption key and counter mode. The key and counter must match those used during encryption to successfully decrypt the data.

**Buffer Conversion**: The encrypted data, which is in hexadecimal string format, is converted back into a buffer. This conversion is necessary to perform the decryption process on binary data.

**Decryption**: The encrypted buffer is decrypted using the AES-256-CTR algorithm. This step reverses the encryption process, transforming the scrambled data back into its original form.

**Concatenation and Decoding**: The decrypted data is concatenated with any additional data generated during the decryption process. The concatenated buffer is then converted back into a UTF-8 string, representing the original plaintext data.

### Security Considerations
- The AES-256-CTR algorithm provides a high level of security and is widely used for data encryption. However, it's crucial to securely manage the encryption key, as access to this key would allow an attacker to decrypt the data (we use the `.env` file to store this value).

- The counter (CTR) mode of operation provides additional security by ensuring that the same plaintext block will encrypt to a different ciphertext block each time, as long as the counter is unique for each encryption operation.