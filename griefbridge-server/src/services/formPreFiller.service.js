import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

/**
 * Form Pre-Filler Service
 * Auto-populates government and standard forms with case data
 */

class FormPreFillerService {
  /**
   * Get available form templates
   */
  getAvailableTemplates() {
    return [
      {
        id: 'EPF_FORM_20',
        name: 'EPF Death Claim - Form 20',
        category: 'FINANCIAL',
        description: 'Employee Provident Fund withdrawal form for death',
        fields: [
          'deceased_name',
          'deceased_dob',
          'epf_account_number',
          'relationship',
          'nominee_name',
          'nominee_address',
          'bank_account',
          'ifsc_code'
        ]
      },
      {
        id: 'LIFE_INSURANCE_CLAIM',
        name: 'Life Insurance Claim Form',
        category: 'FINANCIAL',
        description: 'Standard life insurance claim form',
        fields: [
          'policy_number',
          'deceased_name',
          'date_of_death',
          'cause_of_death',
          'nominee_name',
          'nominee_address',
          'claim_amount',
          'bank_details'
        ]
      },
      {
        id: 'BANK_NOMINATION_FORM',
        name: 'Bank Nomination Form',
        category: 'FINANCIAL',
        description: 'Update nominee for bank accounts',
        fields: [
          'account_holder_name',
          'account_number',
          'nominee_name',
          'nominee_relationship',
          'nominee_address',
          'nominee_contact',
          'nominee_aadhar',
          'bank_name'
        ]
      },
      {
        id: 'SUCCESSION_AFFIDAVIT',
        name: 'Succession Affidavit',
        category: 'LEGAL',
        description: 'Legal affidavit for property succession',
        fields: [
          'deceased_name',
          'deceased_address',
          'date_of_death',
          'property_description',
          'property_value',
          'heirs_list',
          'claimant_name',
          'claimant_address'
        ]
      },
      {
        id: 'ITR_FORM',
        name: 'Income Tax Return (Final)',
        category: 'TAX',
        description: 'Final Income Tax Return filing',
        fields: [
          'pan_number',
          'deceased_name',
          'financial_year',
          'total_income',
          'tax_paid',
          'refund_expected',
          'legal_heir_name',
          'heir_relationship'
        ]
      },
      {
        id: 'GST_CLOSURE',
        name: 'GST Registration Closure',
        category: 'TAX',
        description: 'GST registration closure notification',
        fields: [
          'gst_number',
          'business_name',
          'closure_reason',
          'effective_date',
          'final_return_amount',
          'bank_details',
          'authorized_person_name'
        ]
      },
      {
        id: 'VEHICLE_TRANSFER',
        name: 'Vehicle Transfer Form (RC)',
        category: 'VEHICLES',
        description: 'RTO form for vehicle registration transfer',
        fields: [
          'old_rc_number',
          'vehicle_registration_number',
          'vehicle_make_model',
          'chassis_number',
          'engine_number',
          'new_owner_name',
          'new_owner_address',
          'new_owner_contact'
        ]
      },
      {
        id: 'PROPERTY_MUTATION',
        name: 'Property Mutation Form',
        category: 'PROPERTY',
        description: 'Revenue department form for property mutation',
        fields: [
          'survey_number',
          'property_location',
          'property_value',
          'old_owner_name',
          'new_owner_name',
          'date_of_transfer',
          'mutation_fees_paid',
          'documents_submitted'
        ]
      }
    ];
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId) {
    const templates = this.getAvailableTemplates();
    return templates.find(t => t.id === templateId);
  }

  /**
   * Map case data to form fields
   */
  mapCaseDataToFormFields(caseData, templateId) {
    const {
      deceased,
      caseId,
      procedures,
      owner,
      createdAt
    } = caseData;

    const fieldMappings = {
      // Personal Information
      deceased_name: deceased?.name || '',
      deceased_dob: deceased?.dateOfDeath || '',
      deceased_address: deceased?.state || '',
      date_of_death: deceased?.dateOfDeath
        ? new Date(deceased.dateOfDeath).toLocaleDateString('en-IN')
        : '',

      // Case & Owner Information
      case_id: caseId,
      legal_heir_name: owner?.name || '',
      heir_relationship: 'Family Member',
      claimant_name: owner?.name || '',
      claimant_address: owner?.email || '',

      // Financial Fields
      nominee_name: owner?.name || '',
      nominee_address: owner?.email || '',
      nominee_relationship: 'Legal Heir',
      nominee_contact: owner?.email || '',
      nominee_aadhar: '[To be filled by user]',
      bank_account:  '[To be filled by user]',
      ifsc_code: '[To be filled by user]',
      account_number: '[To be filled by user]',
      account_holder_name: deceased?.name || '',
      pan_number: '[To be filled by user]',
      gst_number: '[To be filled by user]',

      // Property Fields
      property_description: '[To be filled by user]',
      property_value: '[To be filled by user]',
      property_location: deceased?.state || '',
      survey_number: '[To be filled by user]',
      mutation_fees_paid: '[To be filled by user]',
      documents_submitted: procedures.length.toString(),

      // Vehicle Fields
      vehicle_registration_number: '[To be filled by user]',
      vehicle_make_model: '[To be filled by user]',
      chassis_number: '[To be filled by user]',
      engine_number: '[To be filled by user]',
      old_rc_number: '[To be filled by user]',
      old_owner_name: deceased?.name || '',
      new_owner_name: owner?.name || '',
      new_owner_address: owner?.email || '',
      new_owner_contact: owner?.email || '',

      // Administrative Fields
      financial_year: new Date(createdAt).getFullYear().toString(),
      closure_reason: 'Death of proprietor',
      effective_date: new Date(createdAt).toLocaleDateString('en-IN'),
      total_income: '[To be filled by user]',
      tax_paid: '[To be filled by user]',
      refund_expected: '[To be filled by user]',
      business_name: deceased?.name || '',
      final_return_amount: '[To be filled by user]',
      bank_details: '[To be filled by user]',
      authorized_person_name: owner?.name || '',
      relationship: 'Nominee',
      epf_account_number: '[To be filled by user]',
      policy_number: '[To be filled by user]',
      claim_amount: '[To be filled by user]',
      bank_name: '[To be filled by user]',
      date_of_transfer: new Date(createdAt).toLocaleDateString('en-IN'),
      cause_of_death: '[Natural/Accidental/Other]',
      heirs_list: procedures.map(p => p.title).join(', '),
      account_holder_name: deceased?.name || ''
    };

    return fieldMappings;
  }

  /**
   * Generate filled PDF form
   */
  async generateFilledPdf(caseData, templateId) {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const fieldMappings = this.mapCaseDataToFormFields(caseData, templateId);

      // Create simple filled form as text-based PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Letter size
      const fontSize = 10;
      const margin = 50;
      let yPosition = 750;

      // Header
      page.drawText(template.name, {
        x: margin,
        y: yPosition,
        size: 16,
        color: rgb(0.2, 0.2, 0.2)
      });
      yPosition -= 30;

      // Case info
      page.drawText(`Case ID: ${caseData.caseId}`, {
        x: margin,
        y: yPosition,
        size: 9,
        color: rgb(0.5, 0.5, 0.5)
      });
      yPosition -= 20;

      // Form fields
      const fieldsToDisplay = template.fields || [];
      for (const fieldKey of fieldsToDisplay) {
        const fieldLabel = fieldKey
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        const fieldValue = fieldMappings[fieldKey] || '[Required]';

        // Field label
        page.drawText(`${fieldLabel}:`, {
          x: margin,
          y: yPosition,
          size: fontSize - 1,
          color: rgb(0.3, 0.3, 0.3)
        });
        yPosition -= 15;

        // Field value (with line)
        page.drawText(fieldValue.substring(0, 80), {
          x: margin + 20,
          y: yPosition - 5,
          size: fontSize - 2,
          color: rgb(0, 0, 0)
        });

        page.drawLine({
          start: { x: margin + 20, y: yPosition - 15 },
          end: { x: 550, y: yPosition - 15 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8)
        });

        yPosition -= 35;

        // Add new page if needed
        if (yPosition < margin + 50) {
          page.addPage([612, 792]);
          yPosition = 750;
        }
      }

      // Footer
      yPosition = 30;
      page.drawText('Generated by GriefBridge | Instructions: Please fill in marked fields and attach required documents', {
        x: margin,
        y: yPosition,
        size: 8,
        color: rgb(0.6, 0.6, 0.6)
      });

      // Serialize PDF
      const pdfBuffer = await pdfDoc.save();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating filled PDF:', error);
      throw error;
    }
  }

  /**
   * Get instructions for form completion
   */
  getFormInstructions(templateId) {
    const instructions = {
      EPF_FORM_20: `
**EPF Form 20 - Deceased Member's Claim Submission**

**Required Documents:**
1. Duly filled and signed Form 20
2. Death Certificate (Original/Certified Copy)
3. Proof of Relationship
4. Bank Account Details (Cancelled Cheque/Bank Statement)
5. Aadhar Card of Nominee

**Process:**
1. Fill in the form with deceased member details
2. Provide nominee information
3. Specify bank account for credit
4. Submit to EPFO office or online portal
5. Claim is typically processed within 30 days

**Important Notes:**
- Form can be obtained from EPFO website or office
- Claim amount depends on EPF balance and contributions
- Interest up to date of death is included
      `,
      LIFE_INSURANCE_CLAIM: `
**Life Insurance Death Claim Submission**

**Required Documents:**
1. Completed claim form
2. Death Certificate (certified copy)
3. Policy document
4. Medical reports (if death within 2 years of policy issuance)
5. Nominee ID proof and address proof
6. Bank details for claim settlement

**Procedure:**
1. Notify insurance company within 90 days of death
2. Fill and submit the claim form
3. Submit required documents
4. Insurance company will investigate (typically 30 days)
5. Claim settlement follows

**Timeline:** 30-60 days (standard cases), up to 180 days for contested claims
      `,
      SUCCESSION_AFFIDAVIT: `
**Succession Affidavit for Property**

**Required Documents:**
1. Death Certificate
2. Property documents (deed, tax receipts)
3. Property photograph
4. List of legal heirs with their details
5. Affidavit template (court format)
6. Notary or court certification

**Process:**
1. Identify all legal heirs
2. Prepare list of properties
3. Draft affidavit in court format
4. Get notarized by authorized notary
5. Submit to jurisdictional court
6. Obtain authenticated copy

**Cost:** ₹500-2000 for notarization depending on property value
      `
    };

    return instructions[templateId] || 'Please refer to official government website for form instructions';
  }
}

export default new FormPreFillerService();
