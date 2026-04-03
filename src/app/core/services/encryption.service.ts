// src/app/core/services/encryption.service.ts
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly key = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
  private readonly iv = CryptoJS.enc.Utf8.parse('1234567890123456');

  /**
   * Encrypts a string using AES-256-CBC
   */
  encrypt(data: string): string {
    const encrypted = CryptoJS.AES.encrypt(data, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }

  /**
   * Decrypts a base64 string using AES-256-CBC
   */
  decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.key, {
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  /**
   * Checks if a string is valid JSON
   */
  isValidJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}
