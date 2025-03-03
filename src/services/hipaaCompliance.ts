import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { encryptionService } from './encryption';

interface AuditLog {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: any;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: string;
}

export const hipaaComplianceService = {
  // List of fields that should always be encrypted
  sensitiveFields: [
    'medicalRecords',
    'diagnosis',
    'treatment',
    'medications',
    'ssn',
    'dateOfBirth',
    'contactInfo',
    'insuranceInfo',
    'billingInfo',
    'labResults',
  ] as const,

  // Process data before saving to ensure HIPAA compliance
  async processDataForStorage<T extends Record<string, any>>(
    data: T,
    additionalSensitiveFields: string[] = []
  ): Promise<T> {
    // Combine default sensitive fields with additional ones
    const fieldsToEncrypt = [...this.sensitiveFields, ...additionalSensitiveFields];
    
    // Encrypt sensitive fields
    const encryptedData = encryptionService.encryptFields(data, fieldsToEncrypt);
    
    // Add metadata for compliance
    return {
      ...encryptedData,
      hipaaCompliant: true,
      lastEncrypted: serverTimestamp(),
      encryptedFields: fieldsToEncrypt,
    };
  },

  // Process data after retrieval
  processDataAfterRetrieval<T extends Record<string, any>>(
    data: T,
    additionalSensitiveFields: string[] = []
  ): T {
    if (!data) return data;

    const fieldsToDecrypt = [
      ...this.sensitiveFields,
      ...additionalSensitiveFields,
    ].filter(field => data[field]);

    return encryptionService.decryptFields(data, fieldsToDecrypt);
  },

  // Log access to PHI (Protected Health Information)
  async logPhiAccess(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    success: boolean,
    details?: string
  ): Promise<void> {
    const auditLog: AuditLog = {
      userId,
      action,
      resourceType,
      resourceId,
      timestamp: serverTimestamp(),
      ipAddress: await this.getClientIp(),
      userAgent: this.getUserAgent(),
      success,
      details,
    };

    await addDoc(collection(db, 'phi_access_logs'), auditLog);
  },

  // Verify data access authorization
  async verifyAuthorization(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<boolean> {
    // Implement your authorization logic here
    // This should check user roles, permissions, and any necessary business rules
    return true; // Placeholder - implement actual authorization logic
  },

  // Get client IP address (implement proper IP detection based on your setup)
  private async getClientIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  },

  // Get user agent
  private getUserAgent(): string {
    if (typeof window !== 'undefined') {
      return window.navigator.userAgent;
    }
    return 'unknown';
  },

  // Data retention policy check
  async checkDataRetention(data: any): Promise<boolean> {
    // Implement your data retention policy checks here
    // This should verify if data should be retained or deleted based on your policies
    return true; // Placeholder - implement actual retention logic
  },

  // Emergency access procedure
  async grantEmergencyAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    reason: string
  ): Promise<void> {
    // Log emergency access
    await this.logPhiAccess(
      userId,
      'EMERGENCY_ACCESS',
      resourceType,
      resourceId,
      true,
      reason
    );

    // Implement additional emergency access procedures
    // This might include notifications to compliance officers, etc.
  },
}; 