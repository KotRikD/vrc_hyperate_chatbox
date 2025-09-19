import { useCallback, useReducer } from 'react';

import { HyperateOptions, HyperateOptionsAction } from '../utils/types';

const optionsReducer = (
    state: HyperateOptions,
    action: HyperateOptionsAction
): HyperateOptions => {
    const { type } = action;
    switch (type) {
        case 'includeUpDownIcon':
            return { ...state, includeUpDownIcon: action.value };
        case 'include24HourFormat':
            return { ...state, include24HourFormat: action.value };
        case 'vrcOscCompatibility':
            return { ...state, vrcOscCompatibility: action.value };
        case 'vrcHrOscCompatibility':
            return { ...state, vrcHrOscCompatibility: action.value };
        default:
            return state;
    }
};

export const useHyperateOptions = () => {
    const [options, dispatch] = useReducer(optionsReducer, {
        includeUpDownIcon: false,
        include24HourFormat: false,
        vrcOscCompatibility: true,
        vrcHrOscCompatibility: false
    });

    const handleOptionChange = useCallback(
        (type: HyperateOptionsAction['type']) =>
            (e: React.FormEvent<HTMLInputElement>) => {
                e.preventDefault();
                dispatch({
                    type,
                    value: e.currentTarget.checked
                });
            },
        []
    );

    return {
        options,
        handleOptionChange
    };
};
