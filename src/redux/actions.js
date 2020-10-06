export const SAVE_DATA = 'SAVE_DATA';
export const CLEAR_DATA = 'CLEAR_DATA';
export const GET_DATA = 'GET_DATA';
export const GET_DATA_SUCCESS = 'GET_DATA_SUCCESS';

export const getDataSuccess = (value) => ({ type: GET_DATA_SUCCESS, value });
export const saveData = (value) => ({ type: SAVE_DATA , value});
export const getData = () => ({ type: GET_DATA });
export const saveDataSuccess = (value) => ({ type: GET_DATA_SUCCESS, value });
export const clearData = (value) => ({ type: CLEAR_DATA, value });