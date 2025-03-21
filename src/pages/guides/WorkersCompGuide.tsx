import React from 'react';
import { Link } from 'react-router-dom';

const WorkersCompGuide: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">California Workers' Compensation Writer Guide</h1>
      
      <div className="bg-white shadow-md rounded p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          The California Workers' Compensation Writer is a specialized AI assistant designed to help attorneys, paralegals, and self-represented workers create legally compliant California workers' compensation documents.
        </p>
        <p className="mb-4">
          This mode comes with built-in knowledge of:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>California Labor Code Sections 3200-6208</li>
          <li>California Code of Regulations, Title 8, Sections 9700-10397</li>
          <li>WCAB Rules of Practice and Procedure</li>
          <li>Document structure and formatting requirements</li>
          <li>Standardized templates for common legal documents</li>
        </ul>
      </div>
      
      <div className="bg-white shadow-md rounded p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded p-4">
            <h3 className="text-xl font-semibold mb-2">Document Generator</h3>
            <p className="mb-2">Create standardized documents with proper formatting:</p>
            <ul className="list-disc pl-6 mb-2">
              <li>Petitions for Reconsideration</li>
              <li>Declarations of Readiness to Proceed</li>
              <li>Compromise and Release Agreements</li>
            </ul>
            <Link to="/workers-comp/generator" className="text-blue-600 hover:underline">
              Open Document Generator →
            </Link>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="text-xl font-semibold mb-2">Legal Analysis</h3>
            <p className="mb-2">Get help with:</p>
            <ul className="list-disc pl-6">
              <li>Analyzing medical reports</li>
              <li>Determining AOE/COE arguments</li>
              <li>Applying apportionment standards</li>
              <li>Constructing legal arguments</li>
              <li>Challenging adverse decisions</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
        <ol className="list-decimal pl-8 space-y-4">
          <li>
            <strong>Select the CA Workers' Comp Writer Mode</strong>
            <p className="text-sm mt-1">Click on the mode selector and choose "CA Workers' Comp Writer" from the list of available modes.</p>
          </li>
          <li>
            <strong>Ask for Document Creation</strong>
            <p className="text-sm mt-1">Example: "I need to create a Petition for Reconsideration for my client who disagrees with the judge's permanent disability rating."</p>
          </li>
          <li>
            <strong>Provide Case Information</strong>
            <p className="text-sm mt-1">The AI will ask you for specific information about your case to fill out the document correctly.</p>
          </li>
          <li>
            <strong>Review and Edit</strong>
            <p className="text-sm mt-1">Review the generated document and ask the AI to make any necessary changes or improvements.</p>
          </li>
          <li>
            <strong>Export Document</strong>
            <p className="text-sm mt-1">Copy the final document or download it as a file.</p>
          </li>
        </ol>
      </div>
      
      <div className="bg-white shadow-md rounded p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Example Prompts</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            "Help me draft a Declaration of Readiness to Proceed for an expedited hearing on medical treatment that has been denied by utilization review."
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            "I need to create a Compromise and Release agreement for a back injury case with a $50,000 settlement offer."
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            "Analyze this QME report and help me identify arguments for challenging the doctor's apportionment determination."
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            "Help me craft legal arguments for a Petition for Reconsideration of a decision denying temporary disability benefits."
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <h3 className="text-lg font-semibold mb-2">Legal Disclaimer</h3>
        <p className="text-sm">
          The CA Workers' Comp Writer is designed to assist with document creation and legal research, but it does not provide legal advice. All generated documents should be reviewed by a licensed attorney before filing. The information provided is for general informational purposes only and may not reflect current legal developments or address your specific situation.
        </p>
      </div>
    </div>
  );
};

export default WorkersCompGuide; 