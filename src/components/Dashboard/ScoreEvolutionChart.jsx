import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';

/**
 * Chart component for score evolution
 * @param {Object} props - Component props
 * @param {Array} props.evaluations - User evaluations
 * @returns {React.ReactElement} ScoreEvolutionChart component
 */
const ScoreEvolutionChart = ({ evaluations }) => {
  const { t } = useTranslation();

  /**
   * Prepare score evolution data for chart
   * @param {Array} evaluations - User evaluations
   * @returns {Array} Chart data
   */
  const prepareScoreData = (evaluations) => {
    return evaluations
      .map((evaluation, index) => ({
        evaluation: index + 1,
        score: evaluation.score,
        course: evaluation.course,
        evaluationType: evaluation.evaluation_type,
        module: evaluation.module,
        date: evaluation.date ? new Date(evaluation.date.$date || evaluation.date).toLocaleDateString('fr-FR') : ''
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  /**
   * Custom tooltip component
   * @param {Object} props - Tooltip props
   * @returns {React.ReactElement|null} Custom tooltip
   */
  // eslint-disable-next-line no-unused-vars
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Get translated evaluation type
      const getEvaluationTypeLabel = (type) => {
        switch(type) {
          case 'positionnement': return t('dashboard.evaluationType.positionnement');
          case 'module_mixed': return t('dashboard.evaluationType.module_mixed');
          case 'module_case': return t('dashboard.evaluationType.module_case');
          default: return type;
        }
      };

      return (
        <div style={{
          backgroundColor: 'var(--white)',
          border: '1px solid rgba(231, 61, 60, 0.2)',
          borderRadius: 'var(--border-radius-md)',
          padding: '12px',
          boxShadow: 'var(--shadow-light)',
          color: 'var(--text-dark)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--primary)' }}>
            {`${data.score} pts`}
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>
            <strong>{t('dashboard.course')}:</strong> {data.course}
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>
            <strong>{t('dashboard.type')}:</strong> {getEvaluationTypeLabel(data.evaluationType)}
          </p>
          <p style={{ margin: '0', fontSize: '0.8rem', color: 'var(--text-dark)', opacity: 0.7 }}>
            {data.date}
          </p>
        </div>
      );
    }

    return null;
  };

  const scoreEvolution = prepareScoreData(evaluations);

  return (
    <div className="dashboard-chart-card">
      <h3 className="dashboard-chart-title">
        <Clock className="dashboard-chart-icon" />
        {t('dashboard.scoreEvolution')}
      </h3>
      <div className="dashboard-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={scoreEvolution}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(231, 61, 60, 0.1)" />
            <XAxis dataKey="evaluation" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#e73d3c" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#e73d3c' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreEvolutionChart;