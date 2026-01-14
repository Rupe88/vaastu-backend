import * as auditLogService from '../services/auditLogService.js';

/**
 * Middleware to automatically log requests
 */
export const auditLog = (options = {}) => {
  return async (req, res, next) => {
    // Skip audit logging for certain paths
    const skipPaths = ['/health', '/api/payments/webhook'];
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Only log in production or if explicitly enabled
    if (process.env.NODE_ENV === 'development' && !options.logInDevelopment) {
      return next();
    }

    // Calculate risk score
    const riskScore = auditLogService.calculateRiskScore({
      action: req.method + ' ' + req.path,
      userId: req.user?.id,
      ipAddress: req.ip,
      requestPath: req.path,
      isAdmin: req.user?.role === 'ADMIN',
      userAgent: req.get('user-agent'),
    });

    // Log after response
    res.on('finish', async () => {
      try {
        await auditLogService.createAuditLog({
          userId: req.user?.id || null,
          action: req.method,
          entityType: req.path.split('/')[2]?.toUpperCase() || 'UNKNOWN',
          description: `${req.method} ${req.path} - ${res.statusCode}`,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          requestMethod: req.method,
          requestPath: req.path,
          riskScore,
          metadata: {
            statusCode: res.statusCode,
            responseTime: res.locals.responseTime,
          },
        });
      } catch (error) {
        // Don't fail the request if audit logging fails
        console.error('Audit log error:', error);
      }
    });

    next();
  };
};

export default auditLog;

