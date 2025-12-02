'use client';

import { useState, useEffect } from 'react';
import {
  fetchBetTemplates,
  createBetTemplate,
  deleteBetTemplate,
  type BetTemplate,
  type BetTemplateInput,
  type BetInput,
} from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Save, X, Trash2, Zap, Plus } from 'lucide-react';

interface BetTemplatesProps {
  onApplyTemplate: (template: BetTemplate) => void;
  currentFormData: BetInput;
}

export default function BetTemplates({ onApplyTemplate, currentFormData }: BetTemplatesProps) {
  const [templates, setTemplates] = useState<BetTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchBetTemplates();
      if (error) {
        showToast(error.message, 'error');
      } else {
        setTemplates(data || []);
      }
    } catch (err) {
      showToast('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      showToast('Please enter a template name', 'error');
      return;
    }

    try {
      const templateData: BetTemplateInput = {
        name: templateName.trim(),
        description: templateDescription.trim() || null,
        bet_type: currentFormData.bet_type,
        price: currentFormData.price || null,
        stake: currentFormData.stake || null,
        venue: currentFormData.venue || null,
        race_class: currentFormData.race_class || null,
        strategy_tags: currentFormData.strategy_tags || null,
        notes: currentFormData.notes || null,
      };

      const { error } = await createBetTemplate(templateData);
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Template saved successfully!', 'success');
        setShowSaveModal(false);
        setTemplateName('');
        setTemplateDescription('');
        await loadTemplates();
      }
    } catch (err) {
      showToast('Failed to save template', 'error');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const { error } = await deleteBetTemplate(templateId);
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Template deleted successfully!', 'success');
        await loadTemplates();
      }
    } catch (err) {
      showToast('Failed to delete template', 'error');
    }
  };

  const handleApplyTemplate = (template: BetTemplate) => {
    onApplyTemplate(template);
    showToast(`Template "${template.name}" applied!`, 'success');
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Loading templates...</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Entry Templates
        </h3>
        <button
          onClick={() => setShowSaveModal(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Save Current
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">
          No templates yet. Save your current bet form as a template for quick entry.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group relative p-3 bg-card rounded-lg border border-border hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {template.name}
                  </h4>
                  {template.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {template.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      {template.bet_type}
                    </span>
                    {template.price && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                        ${template.price}
                      </span>
                    )}
                    {template.stake && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                        Stake: ${template.stake}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:text-destructive/80 transition-opacity"
                  title="Delete template"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => handleApplyTemplate(template)}
                className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-all"
              >
                <Zap className="h-3 w-3" />
                Apply
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Save Template
              </h3>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setTemplateName('');
                  setTemplateDescription('');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Standard Win Bet"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground bg-background"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of this template"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground bg-background"
                />
              </div>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleSaveTemplate}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
                >
                  <Save className="h-4 w-4" />
                  Save Template
                </button>
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setTemplateName('');
                    setTemplateDescription('');
                  }}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


