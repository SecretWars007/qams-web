import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor funcional para gestionar el indicador de carga global durante las peticiones HTTP.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Mostrar el cargador al iniciar la petición
  loadingService.show();

  return next(req).pipe(
    // Asegurar que el cargador se oculte incluso si la petición falla
    finalize(() => loadingService.hide())
  );
};
