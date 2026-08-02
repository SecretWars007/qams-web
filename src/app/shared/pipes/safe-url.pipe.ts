// src/app/shared/pipes/safe-url.pipe.ts
import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
    name: 'safeUrl',
    standalone: true
})
export class SafeUrlPipe implements PipeTransform {
    private readonly sanitizer = inject(DomSanitizer);

    // SEC-F01: Protocolos explícitamente permitidos — bloquea javascript: y data: URIs
    private readonly ALLOWED_PROTOCOLS = ['http:', 'https:', 'blob:'];

    transform(url: string | null): SafeResourceUrl | null {
        if (!url) return null;

        // Validar que el protocolo sea seguro antes de bypassear el sanitizador
        try {
            const parsed = new URL(url);
            if (!this.ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
                console.warn('[SafeUrlPipe] URL con protocolo no permitido bloqueada:', parsed.protocol);
                return null;
            }
        } catch {
            // URL malformada — no permitir
            console.warn('[SafeUrlPipe] URL malformada bloqueada:', url);
            return null;
        }

        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
