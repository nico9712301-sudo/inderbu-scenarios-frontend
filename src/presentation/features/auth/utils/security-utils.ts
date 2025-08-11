// Utilidades de seguridad para autenticación

/**
 * TIMING ATTACK PROTECTION
 * Normaliza el tiempo de respuesta para evitar que atacantes enumeren emails válidos
 */
export const timingProtection = async (minDelay: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, minDelay));
};

/**
 * RATE LIMITING HELPER
 * Para usar con middleware o en server actions
 */
export const createRateLimiter = (windowMs: number, maxAttempts: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return (identifier: string): { allowed: boolean; retryAfter?: number } => {
    const now = Date.now();
    const userAttempts = attempts.get(identifier);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return { allowed: true };
    }
    
    if (userAttempts.count >= maxAttempts) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000) 
      };
    }
    
    userAttempts.count++;
    return { allowed: true };
  };
};

/**
 * SECURE RANDOM DELAY
 * Añade variabilidad adicional al timing protection
 */
export const secureRandomDelay = async (baseMs: number = 500, varianceMs: number = 200): Promise<void> => {
  const randomVariance = Math.random() * varianceMs;
  const totalDelay = baseMs + randomVariance;
  return new Promise(resolve => setTimeout(resolve, totalDelay));
};
