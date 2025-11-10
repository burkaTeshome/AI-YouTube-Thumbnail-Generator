import React from 'react';
import { ThumbnailSuggestion } from '../types';

interface SuggestionCardProps {
    suggestion: ThumbnailSuggestion;
    onSelect: (suggestion: ThumbnailSuggestion) => void;
}

const SuggestionItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="text-xs">
        <span className="font-semibold text-dark-text-secondary">{label}: </span>
        <span className="text-dark-text">{value}</span>
    </div>
);

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onSelect }) => {
    return (
        <div 
            className="bg-dark-bg border border-dark-border rounded-lg p-4 cursor-pointer hover:border-brand-blue hover:shadow-lg transition-all duration-200"
            onClick={() => onSelect(suggestion)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelect(suggestion)}
            aria-label={`Select suggestion with title ${suggestion.title}`}
        >
            <h4 className="font-bold text-brand-blue mb-2 text-md">&ldquo;{suggestion.title}&rdquo;</h4>
            <p className="text-sm text-dark-text-secondary mb-3">{suggestion.backgroundConcept}</p>
            <div className="grid grid-cols-2 gap-2">
                <SuggestionItem label="Mood" value={suggestion.mood} />
                <SuggestionItem label="Reaction" value={suggestion.imageReaction} />
                <SuggestionItem label="Style" value={suggestion.thumbnailStyle} />
            </div>
            <div className="text-center mt-4">
                <span className="text-sm font-semibold text-brand-purple hover:underline">Use this Idea →</span>
            </div>
        </div>
    );
};
