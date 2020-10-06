const defaultState = {
    startBoundary: {},
    endBoundary: {},
    startCell: {},
    endCell: {},
    cells: [],
    intersection: [],
};

function reducer(state = defaultState, action) {
    switch(action.type) {
        case 'GET_DATA_SUCCESS':
            return {
                ...state,
                startBoundary: action.value.startBoundary,
                endBoundary: action.value.endBoundary,
                startCell: action.value.startCell,
                endCell: action.value.endCell,
                cells: action.value.cells,
                intersection: action.value.intersection,
            }
        case 'SAVE_DATA_SUCCESS': 
            return state;
        case 'CLEAR_DATA': 
            return defaultState;
        default:
            return state;
    }
};

export default reducer;