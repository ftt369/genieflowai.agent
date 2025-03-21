import React, { useState } from 'react';
import { 
  WorkersCompTemplateType, 
  loadWorkersCompTemplate, 
  applyDataToTemplate, 
  validateTemplateData,
  getRequiredFields
} from '../../../utils/workersCompUtils';

type DocumentGeneratorProps = {
  onTemplateGenerated: (content: string) => void;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ onTemplateGenerated }) => {
  const [templateType, setTemplateType] = useState<WorkersCompTemplateType>(WorkersCompTemplateType.PETITION_FOR_RECONSIDERATION);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Get field labels for more user-friendly display
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      case_number: 'Case Number',
      ADJ_number: 'ADJ Number',
      current_date: 'Date',
      applicant_name: 'Applicant Name',
      defendant_name: 'Defendant Name',
      defendant_type: 'Defendant Type (e.g., employer, insurance carrier)',
      insurance_carrier: 'Insurance Carrier',
      petitioner_name: 'Petitioner Name',
      decision_type: 'Decision Type',
      judge_name: 'Judge Name',
      decision_date: 'Decision Date',
      decision_finding: 'Decision Finding',
      ground_1: 'First Ground for Reconsideration',
      ground_2: 'Second Ground for Reconsideration (optional)',
      ground_3: 'Third Ground for Reconsideration (optional)',
      requested_relief: 'Requested Relief',
      attorney_name: 'Attorney Name',
      verifier_name: 'Verifier Name',
      district_office: 'WCAB District Office',
      applicant_address: 'Applicant Address',
      defendant_address: 'Defendant Address',
      claims_administrator: 'Claims Administrator',
      carrier_claim_number: 'Carrier Claim Number',
      declarant_name: 'Declarant Name',
      declarant_title: 'Declarant Title',
      settlement_amount: 'Settlement Amount',
      less_credits: 'Less Credits',
      attorney_fee: 'Attorney Fee',
      balance_to_applicant: 'Balance to Applicant',
      employer_name: 'Employer Name',
      employer_address: 'Employer Address',
      insurance_carrier_address: 'Insurance Carrier Address',
      claim_number: 'Claim Number',
      date_of_injury: 'Date of Injury',
      body_parts: 'Body Parts',
      reasons_for_compromise: 'Reasons for Compromise',
    };

    return labels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const requiredFields = getRequiredFields(templateType);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      // Fill in current date if not specified
      if (!formData.current_date) {
        const today = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        formData.current_date = today;
      }

      // Validate data
      const validation = validateTemplateData(templateType, formData);
      if (!validation.isValid) {
        setErrors(validation.missingFields.map(field => `Missing required field: ${getFieldLabel(field)}`));
        setLoading(false);
        return;
      }

      // Generate document
      const template = loadWorkersCompTemplate(templateType);
      const document = applyDataToTemplate(template, formData);
      
      onTemplateGenerated(document);
    } catch (error) {
      setErrors([`Error generating document: ${(error as Error).message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-semibold mb-4">California Workers' Compensation Document Generator</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Document Type
        </label>
        <select 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value as WorkersCompTemplateType)}
        >
          <option value={WorkersCompTemplateType.PETITION_FOR_RECONSIDERATION}>Petition for Reconsideration</option>
          <option value={WorkersCompTemplateType.DECLARATION_OF_READINESS}>Declaration of Readiness to Proceed</option>
          <option value={WorkersCompTemplateType.COMPROMISE_AND_RELEASE}>Compromise and Release</option>
        </select>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requiredFields.map(field => (
            <div key={field} className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {getFieldLabel(field)}
              </label>
              {field === 'reasons_for_compromise' ? (
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  rows={4}
                />
              ) : (
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentGenerator; 