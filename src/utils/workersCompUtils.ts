/**
 * Utility functions for California Workers' Compensation documents
 */

import fs from 'fs';
import path from 'path';

/**
 * Template types available for Workers' Compensation documents
 */
export enum WorkersCompTemplateType {
  PETITION_FOR_RECONSIDERATION = 'petition-for-reconsideration',
  DECLARATION_OF_READINESS = 'declaration-of-readiness',
  COMPROMISE_AND_RELEASE = 'compromise-and-release',
}

/**
 * Loads a Workers' Compensation template by type
 * @param templateType The type of template to load
 * @returns The template content as a string
 */
export const loadWorkersCompTemplate = (templateType: WorkersCompTemplateType): string => {
  try {
    const templatePath = path.join(
      process.cwd(),
      'src/templates/legal/workers-comp',
      `${templateType}.md`
    );
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error loading Workers' Compensation template: ${error}`);
    return '';
  }
};

/**
 * Applies data to a Workers' Compensation template
 * @param template The template string
 * @param data Object containing the data to insert into the template
 * @returns The populated template
 */
export const applyDataToTemplate = (template: string, data: Record<string, string>): string => {
  let result = template;
  
  // Replace all placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    const regex = new RegExp(placeholder, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
};

/**
 * Gets the list of required fields for a specific template type
 * @param templateType The type of template
 * @returns Array of required field names
 */
export const getRequiredFields = (templateType: WorkersCompTemplateType): string[] => {
  // Common fields across all templates
  const commonFields = ['case_number', 'current_date'];
  
  // Template-specific required fields
  switch (templateType) {
    case WorkersCompTemplateType.PETITION_FOR_RECONSIDERATION:
      return [
        ...commonFields,
        'applicant_name',
        'defendant_name',
        'defendant_type',
        'insurance_carrier',
        'petitioner_name',
        'decision_type',
        'judge_name',
        'decision_date',
        'decision_finding',
        'ground_1',
        'requested_relief',
        'attorney_name',
        'verifier_name',
      ];
      
    case WorkersCompTemplateType.DECLARATION_OF_READINESS:
      return [
        ...commonFields,
        'ADJ_number',
        'district_office',
        'applicant_name',
        'applicant_address',
        'defendant_name',
        'defendant_address',
        'insurance_carrier',
        'claims_administrator',
        'carrier_claim_number',
        'declarant_name',
        'declarant_title',
      ];
      
    case WorkersCompTemplateType.COMPROMISE_AND_RELEASE:
      return [
        ...commonFields,
        'ADJ_number',
        'applicant_name',
        'applicant_address',
        'employer_name',
        'employer_address',
        'insurance_carrier',
        'insurance_carrier_address',
        'claim_number',
        'settlement_amount',
        'less_credits',
        'attorney_fee',
        'balance_to_applicant',
        'date_of_injury',
        'body_parts',
        'reasons_for_compromise',
        'applicant_name',
      ];
      
    default:
      return commonFields;
  }
};

/**
 * Validates if all required fields are present in the data object
 * @param templateType The type of template
 * @param data Object containing the data to validate
 * @returns Object with validation result and missing fields if any
 */
export const validateTemplateData = (
  templateType: WorkersCompTemplateType,
  data: Record<string, string>
): { isValid: boolean; missingFields: string[] } => {
  const requiredFields = getRequiredFields(templateType);
  const missingFields = requiredFields.filter(field => !data[field]);
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Generates standard verification language for California Workers' Compensation documents
 * @param verifierName Name of the person verifying the document
 * @param relationship Relationship to the case (e.g., "applicant", "attorney for applicant")
 * @param location Location where verification is signed
 * @param date Date of verification
 * @returns Formatted verification paragraph
 */
export const generateVerificationLanguage = (
  verifierName: string,
  relationship: string,
  location: string,
  date: string
): string => {
  return `I, ${verifierName}, declare under penalty of perjury that I am the ${relationship} in this matter; that I have read the foregoing document and know the contents thereof; and that the same is true of my own knowledge, except as to those matters which are therein stated upon information and belief, and as to those matters, I believe them to be true.

Executed at ${location}, California on ${date}.

${verifierName}`;
};

/**
 * Generates a proof of service for California Workers' Compensation documents
 * @param documentTitle Title of the document being served
 * @param serverName Name of the person serving the document
 * @param serverAddress Address of the person serving the document
 * @param dateOfService Date the document was served
 * @param recipients Array of recipient objects with name and address
 * @param method Method of service (e.g., "mail", "email", "personal service")
 * @returns Formatted proof of service
 */
export const generateProofOfService = (
  documentTitle: string,
  serverName: string,
  serverAddress: string,
  dateOfService: string,
  recipients: Array<{ name: string; address: string }>,
  method: string
): string => {
  let recipientsList = recipients
    .map(recipient => `${recipient.name}\n${recipient.address}`)
    .join('\n\n');
    
  return `PROOF OF SERVICE

I, ${serverName}, declare that I am over the age of 18 years and not a party to this case. My business address is ${serverAddress}.

On ${dateOfService}, I served a copy of the foregoing ${documentTitle} on the interested parties in this action by placing a true copy thereof in a sealed envelope addressed as follows:

${recipientsList}

and served via ${method}.

I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct.

Date: ${dateOfService}

${serverName}
Declarant`;
}; 