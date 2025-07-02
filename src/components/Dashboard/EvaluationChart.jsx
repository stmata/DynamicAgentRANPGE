import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * Chart component for evaluation distribution
 * @param {Object} props - Component props
 * @param {Array} props.evaluations - User evaluations
 * @returns {React.ReactElement} EvaluationChart component
 */
const EvaluationChart = ({ evaluations }) => {
  const { t } = useTranslation();

  const evaluationsByType = {
    positionnement: evaluations.filter(e => e.evaluation_type === 'positionnement').length,
    module_mixed: evaluations.filter(e => e.evaluation_type === 'module_mixed').length,
    module_case: evaluations.filter(e => e.evaluation_type === 'module_case').length
  };

  const pieData = [
    { name: t('dashboard.evaluationType.positionnement'), value: evaluationsByType.positionnement, color: '#e73d3c' },
    { name: t('dashboard.evaluationType.module_mixed'), value: evaluationsByType.module_mixed, color: '#f9b642' },
    { name: t('dashboard.evaluationType.module_case'), value: evaluationsByType.module_case, color: '#b8012d' }
  ].filter(item => item.value > 0);

  return (
    <div className="dashboard-chart-card">
      <h3 className="dashboard-chart-title">
        <TrendingUp className="dashboard-chart-icon" />
        {t('dashboard.evaluationDistribution')}
      </h3>
      <div className="dashboard-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="dashboard-chart-legend">
        {pieData.map((item, index) => (
          <div key={index} className="dashboard-legend-item">
            <div className="dashboard-legend-color" style={{ backgroundColor: item.color }}></div>
            <span className="dashboard-legend-text">{item.name}</span>
            <span className="dashboard-legend-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationChart;