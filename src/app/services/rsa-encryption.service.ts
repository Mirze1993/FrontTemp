import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RsaEncryptionService {

  constructor() { }

  myPrivateKey: CryptoKey;
  myPublicSpkiB64:string;

  peerSpkiB64:string;

  //RSA KEY GENERATION (CLIENT
  async generateKeypair() {
    const keypair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
      true,
      ["encrypt", "decrypt"]
    );

    this.myPrivateKey = keypair.privateKey;

    const spki = await crypto.subtle.exportKey("spki", keypair.publicKey);
    this.myPublicSpkiB64 = this.arrayBufToB64(spki);
  }



  //ENCRYPT / DECRYPT USING RSA-OAEP

  private async importPeerKey(spki_b64: string) {
    const buf = this.b64ToArrayBuf(spki_b64);
    return await crypto.subtle.importKey(
      "spki",
      buf,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );
  }


  async encryptMessage(peerId: string, plaintext: string) {

    const pubKey = await this.importPeerKey(this.peerSpkiB64);
    const encoded = new TextEncoder().encode(plaintext);

    const encrypted = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      pubKey,
      encoded
    );

    return this.arrayBufToB64(encrypted);
  }

  async decryptMessage(ciphertext_b64: string) {
    const buf = this.b64ToArrayBuf(ciphertext_b64);

    const plainBuf = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      this.myPrivateKey!,
      buf
    );

    return new TextDecoder().decode(plainBuf);
  }

  //helpers
  private arrayBufToB64(buf: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  private b64ToArrayBuf(b64: string) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
  }
}
