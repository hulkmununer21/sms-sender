import React, { useMemo } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import {
  getTemplateVariables,
  countVariableCoverage,
  canFullyPersonalize,
} from "../../utils/templateEngine";

interface Contact {
  id: string;
  name: string | null;
  phone_number: string;
  email: string | null;
}

interface PersonalizationVariableAnalyzerProps {
  template: string;
  contacts: Contact[];
  selectedContactIds: string[];
}

export const PersonalizationVariableAnalyzer: React.FC<
  PersonalizationVariableAnalyzerProps
> = ({ template, contacts, selectedContactIds }) => {
  const selectedContacts = contacts.filter((c) => selectedContactIds.includes(c.id));

  const templateVars = useMemo(
    () => getTemplateVariables(template),
    [template]
  );
  const coverage = useMemo(
    () => countVariableCoverage(template, selectedContacts),
    [template, selectedContacts]
  );
  const analysis = useMemo(
    () => canFullyPersonalize(template, selectedContacts),
    [template, selectedContacts]
  );

  if (templateVars.length === 0) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">No Personalization</p>
            <p className="text-sm text-blue-700 mt-1">
              Your message has no variables (e.g., {`{{first_name}}`}). All recipients will get the same message.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Coverage Status */}
      <div
        className={`p-4 rounded-lg border ${
          analysis.canPersonalize
            ? "bg-green-50 border-green-200"
            : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div className="flex items-start gap-2">
          {analysis.canPersonalize ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p
              className={`text-sm font-medium ${
                analysis.canPersonalize ? "text-green-900" : "text-yellow-900"
              }`}
            >
              {analysis.canPersonalize
                ? "✓ Ready for Personalization"
                : "⚠ Partial Personalization"}
            </p>
            <p
              className={`text-sm mt-1 ${
                analysis.canPersonalize ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {analysis.canPersonalize
                ? "All variables are available for all selected contacts."
                : analysis.issues.length === 1
                  ? analysis.issues[0]
                  : `Some variables missing: ${analysis.issues.length} issues found`}
            </p>
          </div>
        </div>
      </div>

      {/* Variable Breakdown */}
      {templateVars.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Variables Found ({templateVars.length})
          </p>
          <div className="space-y-1">
            {templateVars.map((variable) => {
              const count = coverage[variable] || 0;
              const percentage = Math.round((count / selectedContacts.length) * 100);
              const hasCoverage = count === selectedContacts.length;

              return (
                <div key={variable} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-gray-700">{`{{${variable}}}`}</span>
                    <span
                      className={`font-medium ${
                        hasCoverage ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        hasCoverage ? "bg-green-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-gray-500 mt-1">
                    {count} of {selectedContacts.length} contacts have this data
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-purple-900">Available Variables:</p>
            <p className="text-xs text-purple-700 mt-1 leading-relaxed">
              {`{{first_name}}`} • {`{{last_name}}`} • {`{{full_name}}`} • {`{{area_code}}`} • {`{{state}}`} • {`{{email}}`} • {`{{email_domain}}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationVariableAnalyzer;
