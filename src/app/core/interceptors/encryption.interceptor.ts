// src/app/core/interceptors/encryption.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';

/**
 * Interceptor to handle application-level encryption for API communication.
 * Encrypts POST, PUT, and PATCH request bodies.
 * Decrypts all JSON responses.
 */
export const encryptionInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const encryptionService = inject(EncryptionService);
  const url = req.url.toLowerCase();

  // Solo interceptar peticiones a la API
  const isApi = url.includes('/api/');
  
  // Exclusiones explícitas: swagger, health, o si no es una llamada a la API
  const isExcluded = 
    !isApi ||
    url.includes('/swagger') || 
    url.includes('/health') || 
    (url.endsWith('.json') && !url.includes('/api/'));

  if (isExcluded) {
    return next(req);
  }

  let modifiedReq = req;

  // 1. Request Encryption (POST, PUT, PATCH)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const jsonString = JSON.stringify(req.body);
    const encryptedData = encryptionService.encrypt(jsonString);
    
    modifiedReq = req.clone({
      body: { data: encryptedData },
      setHeaders: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Response Decryption
  return next(modifiedReq).pipe(
    map((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
        const body = event.body as any;
        const rawData = body?.data ?? body?.Data;
        
        // 1. Si el contenido viene como string (probablemente encriptado)
        if (rawData && typeof rawData === 'string') {
          const decryptedString = encryptionService.decrypt(rawData);
          
          if (decryptedString) {
            try {
              const decryptedBody = JSON.parse(decryptedString);
              return event.clone({ body: decryptedBody });
            } catch (e) {
              console.error('EncryptionInterceptor: Error al parsear JSON descifrado', e);
            }
          }
        } 
        // 2. Si el contenido ya es un objeto (no encriptado o ya procesado)
        else if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
          return event.clone({ body: rawData });
        }
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    })
  );
};
