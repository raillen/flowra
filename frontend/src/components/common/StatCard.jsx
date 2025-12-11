
import React from 'react';

const StatCard = ({ label, value, icon: Icon, color = 'blue', subtext }) => {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
    };

    const scheme = colorMap[color] || colorMap.blue;

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-500">{label}</h4>
                <div className={`p-2 rounded-lg ${scheme}`}>
                    {Icon && <Icon size={20} />}
                </div>
            </div>
            <div>
                <span className="text-2xl font-bold text-gray-900 block">{value}</span>
                {subtext && (
                    <p className="text-xs text-gray-400 mt-1">{subtext}</p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
