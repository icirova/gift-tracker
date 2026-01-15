import { useEffect, useMemo, useState } from 'react';

const useBudget = ({ selectedYear, currentBudget, isYearEditable, setBudgets }) => {
  const [budgetEditingYear, setBudgetEditingYear] = useState(null);
  const [budgetDraft, setBudgetDraft] = useState('');

  useEffect(() => {
    setBudgetDraft(currentBudget === null ? '' : String(currentBudget));
    setBudgetEditingYear(null);
  }, [selectedYear, currentBudget]);

  useEffect(() => {
    if (!isYearEditable && budgetEditingYear === selectedYear) {
      setBudgetEditingYear(null);
    }
  }, [budgetEditingYear, isYearEditable, selectedYear]);

  const handleBudgetDraftChange = (event) => {
    setBudgetDraft(event.target.value);
  };

  const handleBudgetEdit = () => {
    if (!isYearEditable) {
      return;
    }
    setBudgetEditingYear(selectedYear);
  };

  const handleBudgetCancel = () => {
    setBudgetDraft(currentBudget === null ? '' : String(currentBudget));
    setBudgetEditingYear(null);
  };

  const handleBudgetSave = () => {
    setBudgets((prev) => {
      if (!budgetDraft.trim()) {
        const next = { ...prev };
        delete next[selectedYear];
        return next;
      }
      const numericValue = Number(budgetDraft);
      if (!Number.isFinite(numericValue) || numericValue < 0) {
        return prev;
      }
      return { ...prev, [selectedYear]: numericValue };
    });
    setBudgetEditingYear(null);
  };

  const isBudgetDirty = useMemo(() => {
    const trimmed = budgetDraft.trim();
    if (currentBudget === null) {
      return trimmed !== '';
    }
    return trimmed !== String(currentBudget);
  }, [budgetDraft, currentBudget]);

  return {
    budgetDraft,
    budgetEditingYear,
    isBudgetDirty,
    handleBudgetDraftChange,
    handleBudgetEdit,
    handleBudgetCancel,
    handleBudgetSave,
  };
};

export default useBudget;
